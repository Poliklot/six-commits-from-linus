import type { GitHubContributor, GitHubRepo, GitHubUser } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubApiError extends Error {
  status: number;
  code: "not_found" | "rate_limit" | "forbidden" | "conflict" | "network" | "unknown";
  resetAt?: Date;

  constructor(
    message: string,
    status: number,
    code: GitHubApiError["code"] = "unknown",
    resetAt?: Date,
  ) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.code = code;
    this.resetAt = resetAt;
  }
}

export function normalizeLogin(login: string): string {
  return login.trim().replace(/^@+/, "").toLowerCase();
}

export function normalizeRepoFullName(repo: string): string {
  return repo
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/^github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .slice(0, 2)
    .join("/");
}

export function isValidRepoFullName(repo: string): boolean {
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo);
}

export function isLikelyBot(login: string): boolean {
  const normalized = login.toLowerCase();
  return (
    normalized.includes("[bot]") ||
    normalized.endsWith("-bot") ||
    normalized.endsWith("bot") ||
    normalized === "dependabot" ||
    normalized === "renovate"
  );
}

type GitHubSearchResponse<T> = {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
};

type GitHubPullRequestSearchItem = {
  html_url: string;
  repository_url: string;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  pull_request?: unknown;
};

async function githubRequest<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${GITHUB_API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  } catch (error) {
    throw new GitHubApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      "network",
    );
  }

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");
    const resetAt = reset ? new Date(Number(reset) * 1000) : undefined;
    const body = await response.text().catch(() => "");
    const message = body || response.statusText;

    if (response.status === 403 && remaining === "0") {
      throw new GitHubApiError(
        "GitHub API rate limit reached. Try again later.",
        response.status,
        "rate_limit",
        resetAt,
      );
    }

    if (response.status === 404) {
      throw new GitHubApiError(message, response.status, "not_found", resetAt);
    }

    if (response.status === 403) {
      throw new GitHubApiError(message, response.status, "forbidden", resetAt);
    }

    if (response.status === 409) {
      throw new GitHubApiError(message, response.status, "conflict", resetAt);
    }

    throw new GitHubApiError(message, response.status, "unknown", resetAt);
  }

  return (await response.json()) as T;
}

export async function getUser(username: string): Promise<GitHubUser> {
  const login = normalizeLogin(username);
  return githubRequest<GitHubUser>(`/users/${encodeURIComponent(login)}`);
}

export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  const login = normalizeLogin(username);
  return githubRequest<GitHubRepo[]>(
    `/users/${encodeURIComponent(login)}/repos?type=owner&sort=pushed&direction=desc&per_page=20`,
  );
}

export async function getRepoContributors(
  fullName: string,
  pages = 1,
): Promise<GitHubContributor[]> {
  const repo = normalizeRepoFullName(fullName);
  const contributors: GitHubContributor[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= pages; page += 1) {
    const pageContributors = await githubRequest<GitHubContributor[]>(
      `/repos/${repo}/contributors?per_page=100&page=${page}&anon=false`,
    );

    for (const contributor of pageContributors) {
      if (!contributor.login || isLikelyBot(contributor.login)) continue;
      const key = normalizeLogin(contributor.login);
      if (seen.has(key)) continue;
      seen.add(key);
      contributors.push(contributor);
    }

    if (pageContributors.length < 100) break;
  }

  return contributors;
}

export async function searchUserPullRequestRepos(
  username: string,
  maxRepos = 24,
): Promise<string[]> {
  const login = normalizeLogin(username);
  const query = encodeURIComponent(`is:pr is:merged author:${login}`);
  const response = await githubRequest<GitHubSearchResponse<GitHubPullRequestSearchItem>>(
    `/search/issues?q=${query}&sort=updated&order=desc&per_page=50`,
  );
  const repos: string[] = [];
  const seen = new Set<string>();

  for (const item of response.items) {
    const fromApiUrl = item.repository_url
      .replace(/^https:\/\/api\.github\.com\/repos\//i, "")
      .trim();
    const fromHtmlUrl = item.html_url
      .replace(/^https:\/\/github\.com\//i, "")
      .split("/")
      .slice(0, 2)
      .join("/");
    const fullName = normalizeRepoFullName(fromApiUrl || fromHtmlUrl);
    const dedupeKey = fullName.toLowerCase();

    if (!isValidRepoFullName(fullName)) continue;
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    repos.push(fullName);

    if (repos.length >= maxRepos) break;
  }

  return repos;
}
