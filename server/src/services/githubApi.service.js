import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// In-memory cache with 10-minute TTL to respect GitHub rate limits
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Fetches and aggregates complete GitHub profile and repository information
 * @param {string} username - GitHub username
 * @param {string|null} accessToken - Optional OAuth token
 */
export async function fetchGithubProfileData(username, accessToken = null) {
  if (!username || !username.trim()) {
    throw ApiError.badRequest("GitHub username is required");
  }

  const cleanUser = username.trim().replace(/^@/, "");
  const cacheKey = `gh_${cleanUser.toLowerCase()}_${accessToken ? "auth" : "pub"}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AI-Resume-Builder-Profile-Generator",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    // 1. Fetch User Profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
      headers,
    });

    if (userRes.status === 404) {
      throw ApiError.notFound(`GitHub user "${cleanUser}" not found`);
    }

    if (userRes.status === 403 || userRes.status === 429) {
      throw ApiError.tooManyRequests(
        "GitHub API rate limit exceeded. Please try again later or connect your GitHub account via OAuth.",
      );
    }

    if (!userRes.ok) {
      throw ApiError.internal(`GitHub API error (${userRes.status})`);
    }

    const userData = await userRes.json();

    // 2. Fetch User Repositories (up to 100 sorted by updated)
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=100`,
      { headers },
    );

    const reposData = reposRes.ok ? await reposRes.json() : [];

    // Filter non-fork repositories and sort by star count
    const ownRepos = Array.isArray(reposData) ? reposData.filter((r) => !r.fork) : [];
    const sortedRepos = [...ownRepos].sort(
      (a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0),
    );

    // Compute top languages
    const langCounts = {};
    let totalStars = 0;
    let totalForks = 0;

    ownRepos.forEach((r) => {
      totalStars += r.stargazers_count || 0;
      totalForks += r.forks_count || 0;
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ language: lang, count }));

    // Extract top featured projects
    const topProjects = sortedRepos.slice(0, 10).map((r) => ({
      title: r.name,
      description: r.description || "Open source repository",
      link: r.html_url,
      stars: String(r.stargazers_count || 0),
      forks: String(r.forks_count || 0),
      tech: r.language || "TypeScript",
      topics: r.topics || [],
      homepage: r.homepage || "",
    }));

    const result = {
      username: userData.login,
      name: userData.name || userData.login,
      bio: userData.bio || "",
      avatarUrl: userData.avatar_url,
      location: userData.location || "",
      company: userData.company || "",
      blog: userData.blog || "",
      twitter: userData.twitter_username || "",
      email: userData.email || "",
      followers: userData.followers || 0,
      following: userData.following || 0,
      publicRepos: userData.public_repos || 0,
      totalStars,
      totalForks,
      topLanguages,
      projects: topProjects,
      profileUrl: userData.html_url,
    };

    // Store in cache
    cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.internal(`Failed to fetch GitHub profile: ${err.message}`);
  }
}

/**
 * Returns GitHub OAuth Authorization URL
 */
export function getGithubOAuthUrl(state) {
  const clientId = env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  if (!clientId) return null;

  const redirectUri = `${env.CLIENT_URL || "http://localhost:5173"}/github-readme?oauth=callback`;
  const scope = encodeURIComponent("read:user repo");
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${scope}&state=${state}`;
}

/**
 * Exchanges GitHub OAuth Code for Access Token
 */
export async function exchangeGithubOAuthCode(code) {
  const clientId = env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw ApiError.badRequest("GitHub OAuth is not configured on the server");
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw ApiError.badRequest(`GitHub OAuth failed: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Checks if username/username profile repository exists and whether README.md already exists
 */
export async function checkProfileRepo(username, token) {
  if (!username) throw ApiError.badRequest("Username is required");
  if (!token) throw ApiError.unauthorized("GitHub Access Token or PAT is required to check repository");

  const cleanUser = username.trim().replace(/^@/, "");
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "AI-Resume-Builder-Profile-Generator",
  };

  // 1. Check if repo exists: GET https://api.github.com/repos/{cleanUser}/{cleanUser}
  const repoRes = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(cleanUser)}/${encodeURIComponent(cleanUser)}`,
    { headers },
  );

  if (repoRes.status === 404) {
    return {
      repoExists: false,
      readmeExists: false,
      defaultBranch: "main",
      sha: null,
      repoUrl: `https://github.com/${cleanUser}/${cleanUser}`,
    };
  }

  if (repoRes.status === 401 || repoRes.status === 403) {
    const errorBody = await repoRes.json().catch(() => ({}));
    throw ApiError.unauthorized(
      errorBody.message || "GitHub authorization failed. Please check your token or permissions.",
    );
  }

  if (!repoRes.ok) {
    throw ApiError.internal(`GitHub error (${repoRes.status}) checking repository`);
  }

  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";

  // 2. Check if README.md exists in repo
  const readmeRes = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(cleanUser)}/${encodeURIComponent(cleanUser)}/contents/README.md?ref=${encodeURIComponent(defaultBranch)}`,
    { headers },
  );

  if (readmeRes.status === 404) {
    return {
      repoExists: true,
      readmeExists: false,
      defaultBranch,
      sha: null,
      repoUrl: repoData.html_url,
    };
  }

  if (!readmeRes.ok) {
    throw ApiError.internal(`GitHub error (${readmeRes.status}) checking existing README`);
  }

  const fileData = await readmeRes.json();
  return {
    repoExists: true,
    readmeExists: true,
    defaultBranch,
    sha: fileData.sha,
    repoUrl: repoData.html_url,
  };
}

/**
 * Creates user's public profile repository: username/username
 */
export async function createProfileRepo(username, token) {
  if (!username) throw ApiError.badRequest("Username is required");
  if (!token) throw ApiError.unauthorized("GitHub Access Token or PAT is required");

  const cleanUser = username.trim().replace(/^@/, "");
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "AI-Resume-Builder-Profile-Generator",
  };

  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: cleanUser,
      description: "My personal GitHub profile README - generated with AI Profile Builder",
      private: false,
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw ApiError.badRequest(
      errData.message || `Failed to create repository ${cleanUser}/${cleanUser}`,
    );
  }

  const data = await res.json();
  return {
    repoUrl: data.html_url,
    defaultBranch: data.default_branch || "main",
  };
}

/**
 * Publishes or updates README.md in username/username
 */
export async function publishProfileReadme({
  username,
  token,
  content,
  commitMessage = "Update GitHub profile README.md",
  sha = null,
  branch = "main",
}) {
  if (!username) throw ApiError.badRequest("Username is required");
  if (!token) throw ApiError.unauthorized("GitHub Access Token or PAT is required");
  if (!content) throw ApiError.badRequest("README content cannot be empty");

  const cleanUser = username.trim().replace(/^@/, "");
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "AI-Resume-Builder-Profile-Generator",
  };

  // If sha is not provided, check if README already exists to prevent conflict
  let fileSha = sha;
  if (!fileSha) {
    try {
      const existingRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(cleanUser)}/${encodeURIComponent(cleanUser)}/contents/README.md?ref=${encodeURIComponent(branch)}`,
        { headers },
      );
      if (existingRes.ok) {
        const existingData = await existingRes.json();
        fileSha = existingData.sha;
      }
    } catch {}
  }

  const encodedContent = Buffer.from(content, "utf-8").toString("base64");
  const payload = {
    message: commitMessage,
    content: encodedContent,
    branch,
  };
  if (fileSha) {
    payload.sha = fileSha;
  }

  const putRes = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(cleanUser)}/${encodeURIComponent(cleanUser)}/contents/README.md`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    },
  );

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => ({}));
    if (putRes.status === 409) {
      throw ApiError.badRequest(
        "A conflict occurred while committing README.md. The repository contents changed remotely. Please refresh and try again.",
      );
    }
    throw ApiError.badRequest(
      errData.message || `Failed to publish README.md (${putRes.status})`,
    );
  }

  const resData = await putRes.json();
  return {
    success: true,
    repoUrl: `https://github.com/${cleanUser}/${cleanUser}`,
    fileUrl: resData.content?.html_url || `https://github.com/${cleanUser}/${cleanUser}/blob/${branch}/README.md`,
    commitUrl: resData.commit?.html_url,
    sha: resData.content?.sha,
  };
}
