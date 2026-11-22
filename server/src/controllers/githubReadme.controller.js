import { asyncHandler } from "../utils/asyncHandler.js";
import * as githubReadmeService from "../services/githubReadme.service.js";

/** Create a new README draft */
export const createReadme = asyncHandler(async (req, res) => {
  const readme = await githubReadmeService.createReadme(req.user.id, req.validatedBody || req.body);
  res.status(201).json({ success: true, data: { readme } });
});

/** List all README projects for authenticated candidate */
export const getUserReadmes = asyncHandler(async (req, res) => {
  const readmes = await githubReadmeService.listReadmes(req.user.id);
  res.json({ success: true, data: { readmes } });
});

/** Get single README by ID */
export const getReadmeById = asyncHandler(async (req, res) => {
  const readme = await githubReadmeService.getReadmeById(req.user.id, req.params.id);
  res.json({ success: true, data: { readme } });
});

/** Update README */
export const updateReadmeById = asyncHandler(async (req, res) => {
  const readme = await githubReadmeService.updateReadme(
    req.user.id,
    req.params.id,
    req.validatedBody || req.body,
  );
  res.json({ success: true, data: { readme } });
});

/** Delete README */
export const deleteReadmeById = asyncHandler(async (req, res) => {
  const result = await githubReadmeService.deleteReadme(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

/** AI Generation */
export const generateReadmeAi = asyncHandler(async (req, res) => {
  const readme = await githubReadmeService.generateReadmeWithAi(
    req.user.id,
    req.validatedBody || req.body,
  );
  res.status(201).json({ success: true, data: { readme } });
});

/** Import Markdown */
export const importReadme = asyncHandler(async (req, res) => {
  const readme = await githubReadmeService.importReadmeMarkdown(
    req.user.id,
    req.validatedBody || req.body,
  );
  res.status(201).json({ success: true, data: { readme } });
});

/** Duplicate README */
export const duplicateReadme = asyncHandler(async (req, res) => {
  const readme = await githubReadmeService.duplicateReadme(req.user.id, req.params.id);
  res.status(201).json({ success: true, data: { readme } });
});

/** AI Editing Assistant */
export const assistReadmeAi = asyncHandler(async (req, res) => {
  const result = await githubReadmeService.assistReadmeWithAi(
    req.user.id,
    req.params.id,
    req.body,
  );
  res.json({ success: true, data: result });
});

/** Fetch GitHub Profile (Public or OAuth) */
export const fetchGithubProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const accessToken = req.user?.githubAccessToken || req.headers["x-github-token"] || null;
  const data = await githubReadmeService.getGithubProfile(username, accessToken);
  res.json({ success: true, data });
});

/** Get GitHub OAuth authorization URL */
export const getGithubOAuthUrl = asyncHandler(async (req, res) => {
  const state = req.query.state || "gh_auth";
  const url = githubReadmeService.getGithubOAuthUrl(state);
  res.json({ success: true, data: { url } });
});

/** Exchange OAuth code */
export const exchangeGithubOAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const token = await githubReadmeService.exchangeGithubOAuthCode(code);
  res.json({ success: true, data: { token } });
});
