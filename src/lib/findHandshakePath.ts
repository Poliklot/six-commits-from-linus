import { FAMOUS_DEVS } from "../data/famous-devs";
import { calculateConfidence } from "./confidence";
import {
  getRepoContributors,
  getUser,
  getUserRepos,
  GitHubApiError,
  isValidRepoFullName,
  normalizeLogin,
  normalizeRepoFullName,
} from "./githubApi";
import type {
  FamousIndex,
  FamousIndexRepo,
  GitHubContributor,
  GitHubRepo,
  HandshakeMatch,
  HandshakeResult,
  HandshakeSearchOptions,
  IndexedRepo,
} from "./types";

type Candidate = Omit<HandshakeMatch, "confidence" | "hops"> & {
  userRepoContributorsCount: number;
  famousRepoContributorsCount: number;
  userRepoPushedAt?: string | null;
  userRepoStars?: number;
  confidenceOverride?: HandshakeMatch["confidence"];
};

const NOT_FOUND_COPY =
  "No connection found in the current public graph. That does not mean no connection exists on GitHub — only that it was not present in this cached contributor graph or returned by the public API.";

const MAX_CLOSEST_RESULTS = 8;
const POWER_REPO_CONTRIBUTOR_PAGES = 3;

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

function getFamousDev(login: string) {
  const normalized = normalizeLogin(login);
  return FAMOUS_DEVS.find((dev) => normalizeLogin(dev.login) === normalized);
}

function contributorsToIndexedRepo(
  contributors: GitHubContributor[],
  category = "Live repo hint",
): IndexedRepo {
  return {
    contributors: contributors.map((contributor) => contributor.login),
    contributorsCount: contributors.length,
    category,
    indexedFor: ["bridge"],
  };
}

function repoContributors(index: FamousIndex, repo: string): IndexedRepo | undefined {
  return index.repoToContributors?.[normalizeRepoFullName(repo)];
}

function findDirectCachedCandidates(
  fromLogin: string,
  index: FamousIndex,
): Candidate[] {
  const normalizedFrom = normalizeLogin(fromLogin);
  return (index.contributorToFamousRepos[normalizedFrom] ?? []).map((entry) => {
    const target = index.famous[normalizeLogin(entry.famousLogin)];
    const repoIndex = target?.repos[entry.repo] ?? repoContributors(index, entry.repo);
    return {
      path: [
        { type: "user", login: fromLogin },
        { type: "repo", fullName: entry.repo },
        { type: "user", login: entry.famousLogin, label: entry.famousName },
      ],
      targetLogin: entry.famousLogin,
      targetName: entry.famousName,
      targetCategory: target?.category,
      degrees: normalizeLogin(entry.famousLogin) === normalizedFrom ? 0 : 1,
      userRepoContributorsCount: repoIndex?.contributorsCount ?? 100,
      famousRepoContributorsCount: repoIndex?.contributorsCount ?? 100,
      explanation:
        normalizeLogin(entry.famousLogin) === normalizedFrom
          ? `@${fromLogin} is already one of the selected open-source developers in the graph.`
          : `@${fromLogin} and @${entry.famousLogin} both appear in ${entry.repo}.`,
      source: "cached-index",
      verifiedUserInRepo: true,
    };
  });
}

function findDirectTargetCandidate(
  fromLogin: string,
  targetLogin: string,
  targetName: string,
  targetCategory: string | undefined,
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
        targetCategory,
        degrees: 1,
        userRepoContributorsCount: repoIndex.contributorsCount,
        famousRepoContributorsCount: repoIndex.contributorsCount,
        explanation: `@${fromLogin} and @${targetLogin} both appear in ${repo}.`,
        source: "target",
        verifiedUserInRepo: true,
      };
    }
  }

  return null;
}

function buildCandidatesFromRepo(
  params: {
    fromLogin: string;
    repo: string;
    repoIndex: IndexedRepo;
    index: FamousIndex;
    source: Candidate["source"];
    verifiedUserInRepo?: boolean;
    userRepo?: GitHubRepo;
  },
): Candidate[] {
  const { fromLogin, repo, repoIndex, index, source, verifiedUserInRepo, userRepo } = params;
  const normalizedFrom = normalizeLogin(fromLogin);
  const contributors = repoIndex.contributors;
  const contributorSet = new Set(contributors.map(normalizeLogin));
  const candidates: Candidate[] = [];

  for (const target of Object.values(index.famous)) {
    const normalizedTarget = normalizeLogin(target.login);
    if (normalizedTarget === normalizedFrom) continue;

    const targetIsOnRepo =
      contributorSet.has(normalizedTarget) ||
      Object.keys(target.repos).map(normalizeRepoFullName).includes(normalizeRepoFullName(repo));

    if (targetIsOnRepo) {
      candidates.push({
        path: [
          { type: "user", login: fromLogin },
          { type: "repo", fullName: repo },
          { type: "user", login: target.login, label: target.name },
        ],
        targetLogin: target.login,
        targetName: target.name,
        targetCategory: target.category,
        degrees: 1,
        userRepoContributorsCount: repoIndex.contributorsCount,
        famousRepoContributorsCount: repoIndex.contributorsCount,
        userRepoPushedAt: userRepo?.pushed_at,
        userRepoStars: userRepo?.stargazers_count,
        explanation: verifiedUserInRepo === false
          ? `Using your ${repo} repo hint, @${target.login} is a known contributor or anchor target for that repository. We did not see @${fromLogin} in the returned contributor window, so treat this as a repo-hint connection.`
          : `@${fromLogin} and @${target.login} connect through ${repo}.`,
        source,
        verifiedUserInRepo,
        confidenceOverride: verifiedUserInRepo === false ? "weak" : undefined,
      });
    }
  }

  for (const contributorLogin of contributors) {
    const normalizedContributor = normalizeLogin(contributorLogin);
    if (normalizedContributor === normalizedFrom) continue;

    const famousRepoEntries = index.contributorToFamousRepos[normalizedContributor] ?? [];
    for (const entry of famousRepoEntries) {
      const target = index.famous[normalizeLogin(entry.famousLogin)];
      if (!target || normalizeLogin(target.login) === normalizedFrom) continue;
      if (normalizeRepoFullName(entry.repo) === normalizeRepoFullName(repo)) continue;

      const famousRepoIndex = target.repos[entry.repo] ?? repoContributors(index, entry.repo);
      candidates.push({
        path: [
          { type: "user", login: fromLogin },
          { type: "repo", fullName: repo },
          { type: "user", login: contributorLogin },
          { type: "repo", fullName: entry.repo },
          { type: "user", login: target.login, label: target.name },
        ],
        targetLogin: target.login,
        targetName: target.name,
        targetCategory: target.category,
        degrees: 2,
        userRepoContributorsCount: repoIndex.contributorsCount,
        famousRepoContributorsCount: famousRepoIndex?.contributorsCount ?? 100,
        userRepoPushedAt: userRepo?.pushed_at,
        userRepoStars: userRepo?.stargazers_count,
        explanation: verifiedUserInRepo === false
          ? `Using your ${repo} repo hint, @${contributorLogin} bridges to @${target.login} through ${entry.repo}. We did not see @${fromLogin} in the returned contributor window, so treat this as a repo-hint connection.`
          : `@${fromLogin} connects to @${target.login} through @${contributorLogin}: ${repo} → ${entry.repo}.`,
        source,
        verifiedUserInRepo,
        confidenceOverride: verifiedUserInRepo === false ? "weak" : undefined,
      });
    }
  }

  return candidates;
}

function dedupeAndSortCandidates(candidates: Candidate[]): Candidate[] {
  const bySignature = new Map<string, Candidate>();

  for (const candidate of candidates) {
    const signature = `${normalizeLogin(candidate.targetLogin)}::${candidate.path
      .map((node) => (node.type === "user" ? `u:${normalizeLogin(node.login)}` : `r:${normalizeRepoFullName(node.fullName)}`))
      .join("|")}`;
    const existing = bySignature.get(signature);
    if (!existing || compareCandidates(candidate, existing) < 0) {
      bySignature.set(signature, candidate);
    }
  }

  return Array.from(bySignature.values()).sort(compareCandidates);
}

function compareCandidates(a: Candidate, b: Candidate): number {
  const degreesDiff = a.degrees - b.degrees;
  if (degreesDiff !== 0) return degreesDiff;

  const verifiedDiff = Number(b.verifiedUserInRepo === true) - Number(a.verifiedUserInRepo === true);
  if (verifiedDiff !== 0) return verifiedDiff;

  const maxA = Math.max(a.userRepoContributorsCount, a.famousRepoContributorsCount);
  const maxB = Math.max(b.userRepoContributorsCount, b.famousRepoContributorsCount);
  const sizeDiff = maxA - maxB;
  if (sizeDiff !== 0) return sizeDiff;

  const pushedDiff =
    (b.userRepoPushedAt ? new Date(b.userRepoPushedAt).getTime() : 0) -
    (a.userRepoPushedAt ? new Date(a.userRepoPushedAt).getTime() : 0);
  if (pushedDiff !== 0) return pushedDiff;

  return (b.userRepoStars ?? 0) - (a.userRepoStars ?? 0);
}

function uniqueBestByTarget(candidates: Candidate[]): Candidate[] {
  const sorted = dedupeAndSortCandidates(candidates);
  const byTarget = new Map<string, Candidate>();
  for (const candidate of sorted) {
    const key = normalizeLogin(candidate.targetLogin);
    if (!byTarget.has(key)) byTarget.set(key, candidate);
  }
  return Array.from(byTarget.values()).sort(compareCandidates);
}

function candidateToMatch(candidate: Candidate): HandshakeMatch {
  const confidence =
    candidate.confidenceOverride ??
    calculateConfidence(
      candidate.userRepoContributorsCount,
      candidate.famousRepoContributorsCount,
    );

  return {
    targetLogin: candidate.targetLogin,
    targetName: candidate.targetName,
    targetCategory: candidate.targetCategory,
    degrees: candidate.degrees,
    hops: candidate.path.length - 1,
    confidence,
    path: candidate.path,
    explanation: candidate.explanation,
    source: candidate.source,
    verifiedUserInRepo: candidate.verifiedUserInRepo,
  };
}

function foundResult(
  best: Candidate,
  candidates: Candidate[],
  mode: "target" | "closest",
  indexGeneratedAt: string | null,
): HandshakeResult {
  const alternatives = uniqueBestByTarget(candidates)
    .filter((candidate) => normalizeLogin(candidate.targetLogin) !== normalizeLogin(best.targetLogin))
    .slice(0, MAX_CLOSEST_RESULTS - 1)
    .map(candidateToMatch);
  const match = candidateToMatch(best);

  return {
    status: "found",
    searchMode: mode,
    summary:
      mode === "closest"
        ? `Closest match: @${match.targetLogin} in ${match.degrees} contributor ${match.degrees === 1 ? "link" : "links"}.`
        : `Connected to @${match.targetLogin} in ${match.degrees} contributor ${match.degrees === 1 ? "link" : "links"}.`,
    alternatives,
    indexGeneratedAt,
    ...match,
  };
}

function errorToMessage(error: unknown): string {
  if (error instanceof GitHubApiError) {
    if (error.code === "rate_limit") {
      return "GitHub API rate limit reached. Try again later, or use a repo hint so the app can rely more on the cached graph.";
    }

    if (error.code === "not_found") {
      return "GitHub user or repository was not found. Check the spelling and try again.";
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

function validateUsername(fromLogin: string): HandshakeResult | null {
  if (!fromLogin) {
    return { status: "error", message: "Enter a GitHub username first." };
  }

  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(fromLogin)) {
    return {
      status: "error",
      message: "GitHub usernames may contain letters, numbers, and hyphens only.",
    };
  }

  return null;
}

async function candidatesFromRepoHint(
  fromLogin: string,
  contributedRepo: string,
  index: FamousIndex,
): Promise<Candidate[]> {
  const repo = normalizeRepoFullName(contributedRepo);
  if (!isValidRepoFullName(repo)) {
    throw new Error("Repository hint should look like owner/repo, for example prettier/prettier.");
  }

  let repoIndex = repoContributors(index, repo);

  // Important for GitHub Pages: if the repo is already in the static graph, do not
  // spend the user's unauthenticated API quota. Live fetching is only a fallback for
  // custom repositories that are not cached yet.
  if (!repoIndex) {
    const liveContributors = await getRepoContributors(repo, POWER_REPO_CONTRIBUTOR_PAGES);
    if (liveContributors.length > 0) {
      repoIndex = contributorsToIndexedRepo(liveContributors);
    }
  }

  if (!repoIndex) {
    return [];
  }

  const verifiedUserInRepo = repoIndex.contributors.map(normalizeLogin).includes(normalizeLogin(fromLogin));
  return buildCandidatesFromRepo({
    fromLogin,
    repo,
    repoIndex,
    index,
    source: "repo-hint",
    verifiedUserInRepo,
  });
}

async function candidatesFromUserRepos(fromLogin: string, index: FamousIndex): Promise<Candidate[]> {
  const repos = sortUserRepos(await getUserRepos(fromLogin));
  const candidates: Candidate[] = [];

  for (const repo of repos) {
    try {
      const contributors = await getRepoContributors(repo.full_name);
      candidates.push(
        ...buildCandidatesFromRepo({
          fromLogin,
          repo: repo.full_name,
          repoIndex: contributorsToIndexedRepo(contributors, "User repository"),
          index,
          source: "closest",
          verifiedUserInRepo: contributors.map((c) => normalizeLogin(c.login)).includes(normalizeLogin(fromLogin)),
          userRepo: repo,
        }),
      );
    } catch (error) {
      if (error instanceof GitHubApiError && error.code === "rate_limit") throw error;
    }
  }

  return candidates;
}

export async function searchHandshake(options: HandshakeSearchOptions): Promise<HandshakeResult> {
  const fromLogin = normalizeLogin(options.fromLogin);
  const invalidUsername = validateUsername(fromLogin);
  if (invalidUsername) return invalidUsername;

  if (options.mode === "target" && !options.toFamousLogin) {
    return { status: "error", message: "Choose a target developer or switch to closest mode." };
  }

  const targetLogin = options.toFamousLogin ? normalizeLogin(options.toFamousLogin) : undefined;
  const targetDev = targetLogin ? getFamousDev(targetLogin) : undefined;

  if (options.mode === "target" && !targetDev) {
    return { status: "error", message: "Choose a famous developer from the list." };
  }

  if (targetLogin && fromLogin === targetLogin && targetDev) {
    return {
      status: "found",
      searchMode: options.mode,
      summary: `@${fromLogin} is the selected target.`,
      targetLogin: targetDev.login,
      targetName: targetDev.name,
      targetCategory: targetDev.category,
      degrees: 0,
      hops: 0,
      confidence: "strong",
      path: [{ type: "user", login: targetDev.login, label: targetDev.name }],
      explanation: `@${fromLogin} is already ${targetDev.name}.`,
      source: "target",
      verifiedUserInRepo: true,
      alternatives: [],
      indexGeneratedAt: null,
    };
  }

  try {
    const index = await loadFamousIndex();
    const hasRepoHint = Boolean(options.contributedRepo?.trim());
    const user = hasRepoHint ? { login: fromLogin } : await getUser(fromLogin);
    const displayLogin = user.login;
    const candidates: Candidate[] = [];

    candidates.push(...findDirectCachedCandidates(displayLogin, index));

    if (targetDev) {
      const targetIndex = index.famous[targetLogin!] ?? index.famous[normalizeLogin(targetDev.login)];
      if (targetIndex) {
        const direct = findDirectTargetCandidate(
          displayLogin,
          targetDev.login,
          targetDev.name,
          targetDev.category,
          targetIndex.repos,
        );
        if (direct) candidates.push(direct);
      }
    }

    if (options.contributedRepo?.trim()) {
      candidates.push(...(await candidatesFromRepoHint(displayLogin, options.contributedRepo, index)));
    } else {
      candidates.push(...(await candidatesFromUserRepos(displayLogin, index)));
    }

    const filtered = targetDev
      ? candidates.filter((candidate) => normalizeLogin(candidate.targetLogin) === normalizeLogin(targetDev.login))
      : candidates;

    const bestByTarget = uniqueBestByTarget(filtered);
    const best = bestByTarget[0];

    if (best) {
      return foundResult(best, bestByTarget, options.mode, index.generatedAt);
    }

    return {
      status: "not_found",
      explanation: NOT_FOUND_COPY,
      indexGeneratedAt: index.generatedAt,
    };
  } catch (error) {
    return { status: "error", message: errorToMessage(error) };
  }
}

export async function findHandshakePath(
  fromLogin: string,
  toFamousLogin: string,
): Promise<HandshakeResult> {
  return searchHandshake({ fromLogin, toFamousLogin, mode: "target" });
}
