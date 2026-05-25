import { FAMOUS_DEVS } from "../data/famous-devs";
import { calculateConfidence } from "./confidence";
import {
  getRepoContributors,
  getUser,
  getUserRepos,
  GitHubApiError,
  normalizeLogin,
} from "./githubApi";
import type {
  ContributorFamousRepo,
  FamousIndex,
  FamousIndexRepo,
  GitHubContributor,
  GitHubRepo,
  HandshakeResult,
  PathNode,
} from "./types";

type Candidate = {
  path: PathNode[];
  targetLogin: string;
  targetName: string;
  degrees: number;
  userRepoContributorsCount: number;
  famousRepoContributorsCount: number;
  userRepoPushedAt?: string | null;
  userRepoStars?: number;
  explanation: string;
};

const NOT_FOUND_COPY =
  "No path found inside the MVP graph. This does not mean no connection exists on GitHub — only that we did not find one in this limited public-data index.";

function publicDataUrl(fileName: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${fileName}`.replace(/\/\//g, "/");
}

async function loadFamousIndex(): Promise<FamousIndex> {
  const response = await fetch(publicDataUrl("data/famous-index.json"), {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(
      `Could not load famous-index.json (${response.status} ${response.statusText})`,
    );
  }

  return (await response.json()) as FamousIndex;
}

function repoPushedAtTime(repo: Pick<GitHubRepo, "pushed_at">): number {
  return repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
}

function sortUserRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos
    .filter((repo) => !repo.archived && !repo.fork)
    .sort((a, b) => {
      const starsDiff = b.stargazers_count - a.stargazers_count;
      if (starsDiff !== 0) return starsDiff;
      return repoPushedAtTime(b) - repoPushedAtTime(a);
    })
    .slice(0, 15);
}

function findDirectCandidate(
  fromLogin: string,
  targetLogin: string,
  targetName: string,
  famousRepos: Record<string, FamousIndexRepo>,
): Candidate | null {
  const normalizedFrom = normalizeLogin(fromLogin);

  for (const [repo, repoIndex] of Object.entries(famousRepos)) {
    const contributors = repoIndex.contributors.map(normalizeLogin);
    if (contributors.includes(normalizedFrom)) {
      return {
        path: [
          { type: "user", login: fromLogin },
          { type: "repo", fullName: repo },
          { type: "user", login: targetLogin, label: targetName },
        ],
        targetLogin,
        targetName,
        degrees: 1,
        userRepoContributorsCount: repoIndex.contributorsCount,
        famousRepoContributorsCount: repoIndex.contributorsCount,
        explanation: `@${fromLogin} and @${targetLogin} both appear as contributors of ${repo}.`,
      };
    }
  }

  return null;
}

function findRepoTargetCandidate(
  fromLogin: string,
  targetLogin: string,
  targetName: string,
  userRepo: GitHubRepo,
  contributors: GitHubContributor[],
): Candidate | null {
  const target = contributors.find(
    (contributor) => normalizeLogin(contributor.login) === normalizeLogin(targetLogin),
  );

  if (!target) return null;

  return {
    path: [
      { type: "user", login: fromLogin },
      { type: "repo", fullName: userRepo.full_name },
      { type: "user", login: target.login, label: targetName },
    ],
    targetLogin,
    targetName,
    degrees: 1,
    userRepoContributorsCount: contributors.length,
    famousRepoContributorsCount: contributors.length,
    userRepoPushedAt: userRepo.pushed_at,
    userRepoStars: userRepo.stargazers_count,
    explanation: `@${fromLogin} and @${target.login} both appear as contributors of ${userRepo.full_name}.`,
  };
}

function buildIndirectCandidates(
  fromLogin: string,
  targetLogin: string,
  targetName: string,
  userRepo: GitHubRepo,
  contributors: GitHubContributor[],
  contributorToFamousRepos: Record<string, ContributorFamousRepo[]>,
  famousRepos: Record<string, FamousIndexRepo>,
): Candidate[] {
  const candidates: Candidate[] = [];
  const normalizedFrom = normalizeLogin(fromLogin);
  const normalizedTarget = normalizeLogin(targetLogin);

  for (const contributor of contributors) {
    const contributorLogin = normalizeLogin(contributor.login);
    if (contributorLogin === normalizedFrom || contributorLogin === normalizedTarget) {
      continue;
    }

    const matchingFamousRepos = (contributorToFamousRepos[contributorLogin] ?? []).filter(
      (entry) => normalizeLogin(entry.famousLogin) === normalizedTarget,
    );

    for (const famousRepo of matchingFamousRepos) {
      const famousRepoIndex = famousRepos[famousRepo.repo];
      candidates.push({
        path: [
          { type: "user", login: fromLogin },
          { type: "repo", fullName: userRepo.full_name },
          { type: "user", login: contributor.login },
          { type: "repo", fullName: famousRepo.repo },
          { type: "user", login: targetLogin, label: targetName },
        ],
        targetLogin,
        targetName,
        degrees: 2,
        userRepoContributorsCount: contributors.length,
        famousRepoContributorsCount: famousRepoIndex?.contributorsCount ?? 100,
        userRepoPushedAt: userRepo.pushed_at,
        userRepoStars: userRepo.stargazers_count,
        explanation: `@${fromLogin} connects to @${targetLogin} through @${contributor.login}: both contributed to ${userRepo.full_name}, and @${contributor.login} also appears in ${famousRepo.repo}.`,
      });
    }
  }

  return candidates;
}

function sortCandidates(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => {
    const degreesDiff = a.degrees - b.degrees;
    if (degreesDiff !== 0) return degreesDiff;

    const maxA = Math.max(a.userRepoContributorsCount, a.famousRepoContributorsCount);
    const maxB = Math.max(b.userRepoContributorsCount, b.famousRepoContributorsCount);
    const sizeDiff = maxA - maxB;
    if (sizeDiff !== 0) return sizeDiff;

    const pushedDiff =
      (b.userRepoPushedAt ? new Date(b.userRepoPushedAt).getTime() : 0) -
      (a.userRepoPushedAt ? new Date(a.userRepoPushedAt).getTime() : 0);
    if (pushedDiff !== 0) return pushedDiff;

    return (b.userRepoStars ?? 0) - (a.userRepoStars ?? 0);
  });
}

function candidateToResult(candidate: Candidate): HandshakeResult {
  return {
    status: "found",
    targetLogin: candidate.targetLogin,
    targetName: candidate.targetName,
    degrees: candidate.degrees,
    hops: candidate.path.length - 1,
    confidence: calculateConfidence(
      candidate.userRepoContributorsCount,
      candidate.famousRepoContributorsCount,
    ),
    path: candidate.path,
    explanation: candidate.explanation,
  };
}

function errorToMessage(error: unknown): string {
  if (error instanceof GitHubApiError) {
    if (error.code === "rate_limit") {
      return "GitHub API rate limit reached. Try again later or run locally with GITHUB_TOKEN for index generation.";
    }

    if (error.code === "not_found") {
      return "GitHub user or repository was not found. Check the username and try again.";
    }

    if (error.code === "forbidden") {
      return "GitHub denied this request. It may be a temporary limit or repository-level restriction.";
    }

    if (error.code === "conflict") {
      return "GitHub could not return contributors for one of the repositories yet. Try another account or try later.";
    }

    if (error.code === "network") {
      return "Network error while contacting GitHub. Check your connection and try again.";
    }
  }

  return error instanceof Error ? error.message : "Unexpected error while searching.";
}

export async function findHandshakePath(
  fromLoginInput: string,
  toFamousLoginInput: string,
): Promise<HandshakeResult> {
  const fromLogin = normalizeLogin(fromLoginInput);
  const toFamousLogin = normalizeLogin(toFamousLoginInput);

  if (!fromLogin) {
    return { status: "error", message: "Enter a GitHub username first." };
  }

  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(fromLogin)) {
    return {
      status: "error",
      message: "GitHub usernames may contain letters, numbers, and hyphens only.",
    };
  }

  const famousDev = FAMOUS_DEVS.find(
    (dev) => normalizeLogin(dev.login) === toFamousLogin,
  );

  if (!famousDev) {
    return { status: "error", message: "Choose a famous developer from the list." };
  }

  if (fromLogin === toFamousLogin) {
    return {
      status: "found",
      targetLogin: famousDev.login,
      targetName: famousDev.name,
      degrees: 0,
      hops: 0,
      confidence: "strong",
      path: [{ type: "user", login: famousDev.login, label: famousDev.name }],
      explanation: `@${fromLogin} is the selected famous developer. That is a zero-degree connection.`,
    };
  }

  try {
    const [index, user] = await Promise.all([loadFamousIndex(), getUser(fromLogin)]);
    const targetIndex = index.famous[toFamousLogin] ?? index.famous[famousDev.login];

    if (!targetIndex) {
      return {
        status: "not_found",
        explanation:
          "The famous index has not been generated yet for this target. Run npm run build:index and try again.",
      };
    }

    const directCandidate = findDirectCandidate(
      user.login,
      famousDev.login,
      famousDev.name,
      targetIndex.repos,
    );
    if (directCandidate) return candidateToResult(directCandidate);

    const repos = sortUserRepos(await getUserRepos(user.login));
    const candidates: Candidate[] = [];

    for (const repo of repos) {
      try {
        const contributors = await getRepoContributors(repo.full_name);
        const directRepoCandidate = findRepoTargetCandidate(
          user.login,
          famousDev.login,
          famousDev.name,
          repo,
          contributors,
        );
        if (directRepoCandidate) candidates.push(directRepoCandidate);

        candidates.push(
          ...buildIndirectCandidates(
            user.login,
            famousDev.login,
            famousDev.name,
            repo,
            contributors,
            index.contributorToFamousRepos,
            targetIndex.repos,
          ),
        );
      } catch (error) {
        if (error instanceof GitHubApiError && error.code === "rate_limit") {
          throw error;
        }
        // Per MVP requirements, skip individual repositories that GitHub cannot serve.
      }
    }

    const best = sortCandidates(candidates)[0];
    if (best) return candidateToResult(best);

    return { status: "not_found", explanation: NOT_FOUND_COPY };
  } catch (error) {
    return { status: "error", message: errorToMessage(error) };
  }
}
