import { isLikelyBot } from "./githubApi";
import type { FamousIndex, IndexedRepo } from "./types";

function withoutBots(repo: IndexedRepo): IndexedRepo {
  const contributors = repo.contributors.filter((login) => !isLikelyBot(login));
  return { ...repo, contributors, contributorsCount: contributors.length };
}

function filterRepos(repos: Record<string, IndexedRepo>): Record<string, IndexedRepo> {
  return Object.fromEntries(
    Object.entries(repos).map(([repo, data]) => [repo, withoutBots(data)]),
  );
}

// Apply the same policy to every view of the graph, including older JSON files
// whose contributor lists and reverse mappings still contain coding agents.
export function excludeBotsFromIndex(index: FamousIndex): FamousIndex {
  const famous = Object.fromEntries(
    Object.entries(index.famous)
      .filter(([key, dev]) => !isLikelyBot(key) && !isLikelyBot(dev.login))
      .map(([key, dev]) => [key, { ...dev, repos: filterRepos(dev.repos) }]),
  );
  const contributorToFamousRepos = Object.fromEntries(
    Object.entries(index.contributorToFamousRepos)
      .filter(([login]) => !isLikelyBot(login))
      .map(([login, entries]) => [
        login,
        entries.filter((entry) => !isLikelyBot(entry.famousLogin)),
      ]),
  );
  const repoToContributors = index.repoToContributors
    ? filterRepos(index.repoToContributors)
    : undefined;
  const contributorToRepos = index.contributorToRepos
    ? Object.fromEntries(
        Object.entries(index.contributorToRepos).filter(([login]) => !isLikelyBot(login)),
      )
    : undefined;

  return {
    ...index,
    famous,
    contributorToFamousRepos,
    repoToContributors,
    contributorToRepos,
    stats: index.stats ? {
      ...index.stats,
      famousCount: Object.keys(famous).length,
      contributorCount: Object.keys(contributorToRepos ?? contributorToFamousRepos).length,
    } : undefined,
  };
}
