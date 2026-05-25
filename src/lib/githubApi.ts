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
): Promise<GitHubContributor[]> {
  return githubRequest<GitHubContributor[]>(
    `/repos/${fullName}/contributors?per_page=100&anon=false`,
  ).then((contributors) =>
    contributors.filter((contributor) => contributor.login && !isLikelyBot(contributor.login)),
  );
}
