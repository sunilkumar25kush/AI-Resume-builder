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
