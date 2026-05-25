import type { GitHubContributor, GitHubRepo, GitHubUser } from "../src/lib/types";
import { isLikelyBot, normalizeRepoFullName } from "../src/lib/githubApi";

const GITHUB_API_BASE = "https://api.github.com";
const token = process.env.GITHUB_TOKEN?.trim();

export class GitHubScriptError extends Error {
  status: number;
  path: string;
  code: "not_found" | "rate_limit" | "forbidden" | "conflict" | "unknown" | "network";

  constructor(
    message: string,
    status: number,
    path: string,
    code: GitHubScriptError["code"] = "unknown",
  ) {
    super(message);
    this.name = "GitHubScriptError";
    this.status = status;
    this.path = path;
    this.code = code;
  }
}

function headers(): HeadersInit {
  const baseHeaders: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "six-commits-from-linus-indexer",
  };

  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  return baseHeaders;
}

export function hasGitHubToken(): boolean {
  return Boolean(token);
}

export function normalizeContributorLogin(login: string): string {
  return login.trim().replace(/^@+/, "").toLowerCase();
}

export async function githubRequest<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${GITHUB_API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: headers() });
  } catch (error) {
    throw new GitHubScriptError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      path,
      "network",
    );
  }

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const body = await response.text().catch(() => "");
    const message = body || response.statusText;

    if (response.status === 403 && remaining === "0") {
      throw new GitHubScriptError(
        "GitHub API rate limit reached. Set GITHUB_TOKEN and retry.",
        response.status,
        path,
        "rate_limit",
      );
    }

    if (response.status === 404) {
      throw new GitHubScriptError(message, response.status, path, "not_found");
    }

    if (response.status === 403) {
      throw new GitHubScriptError(message, response.status, path, "forbidden");
    }

    if (response.status === 409) {
      throw new GitHubScriptError(message, response.status, path, "conflict");
    }

    throw new GitHubScriptError(message, response.status, path);
  }

  return (await response.json()) as T;
}

export async function getUser(login: string): Promise<GitHubUser> {
  return githubRequest<GitHubUser>(`/users/${encodeURIComponent(login)}`);
}

export async function getRepository(fullName: string): Promise<GitHubRepo> {
  return githubRequest<GitHubRepo>(`/repos/${fullName}`);
}

export async function getRepoContributors(
  fullName: string,
  pages = Number(process.env.INDEX_CONTRIBUTOR_PAGES ?? "2"),
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
      const key = normalizeContributorLogin(contributor.login);
      if (seen.has(key)) continue;
      seen.add(key);
      contributors.push(contributor);
    }

    if (pageContributors.length < 100) break;
  }

  return contributors;
}
