import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { BRIDGE_REPOS } from "../src/data/bridge-repos";
import { FAMOUS_DEVS } from "../src/data/famous-devs";
import { normalizeRepoFullName } from "../src/lib/githubApi";
import type { FamousIndex, IndexedRepo } from "../src/lib/types";
import {
  getRepoContributors,
  GitHubScriptError,
  hasGitHubToken,
  normalizeContributorLogin,
} from "./github";

const outputPath = resolve("public/data/famous-index.json");

type Warning = {
  source: string;
  repo: string;
  message: string;
};

type RepoPlanEntry = {
  fullName: string;
  category?: string;
  indexedFor: Set<"famous" | "bridge">;
};

function addContributorMapping(
  index: FamousIndex,
  contributorLogin: string,
  famousLogin: string,
  famousName: string,
  repo: string,
) {
  const normalized = normalizeContributorLogin(contributorLogin);
  const existing = index.contributorToFamousRepos[normalized] ?? [];
  const duplicate = existing.some(
    (entry) => entry.famousLogin === famousLogin && entry.repo === repo,
  );

  if (!duplicate) {
    existing.push({ famousLogin, famousName, repo });
  }

  index.contributorToFamousRepos[normalized] = existing;
}

function addContributorRepo(index: FamousIndex, contributorLogin: string, repo: string) {
  const normalized = normalizeContributorLogin(contributorLogin);
  index.contributorToRepos ??= {};
  const existing = index.contributorToRepos[normalized] ?? [];
  if (!existing.includes(repo)) existing.push(repo);
  index.contributorToRepos[normalized] = existing;
}

function buildRepoPlan(): Map<string, RepoPlanEntry> {
  const plan = new Map<string, RepoPlanEntry>();

  function upsert(repoInput: string, indexedFor: "famous" | "bridge", category?: string) {
    const fullName = normalizeRepoFullName(repoInput);
    const existing = plan.get(fullName) ?? {
      fullName,
      category,
      indexedFor: new Set<"famous" | "bridge">(),
    };
    existing.indexedFor.add(indexedFor);
    existing.category ??= category;
    plan.set(fullName, existing);
  }

  for (const dev of FAMOUS_DEVS) {
    for (const repo of dev.anchorRepos) upsert(repo, "famous", dev.category);
  }

  for (const repo of BRIDGE_REPOS) {
    upsert(repo.fullName, "bridge", repo.category);
  }

  return plan;
}

async function fetchIndexedRepos(
  repoPlan: Map<string, RepoPlanEntry>,
  warnings: Warning[],
): Promise<Record<string, IndexedRepo>> {
  const repoToContributors: Record<string, IndexedRepo> = {};

  for (const entry of repoPlan.values()) {
    try {
      const contributors = await getRepoContributors(entry.fullName);
      const contributorLogins = contributors.map((contributor) => contributor.login);
      repoToContributors[entry.fullName] = {
        contributors: contributorLogins,
        contributorsCount: contributorLogins.length,
        category: entry.category,
        indexedFor: Array.from(entry.indexedFor),
      };
      console.log(
        `  ✅ ${entry.fullName} contributors: ${contributorLogins.length} [${Array.from(entry.indexedFor).join(", ")}]`,
      );
    } catch (error) {
      const message =
        error instanceof GitHubScriptError
          ? `${error.status} ${error.code}`
          : error instanceof Error
            ? error.message
            : "unknown error";
      warnings.push({ source: Array.from(entry.indexedFor).join("+"), repo: entry.fullName, message });
      console.warn(`  ⚠️ ${entry.fullName} ${message}`);
    }
  }

  return repoToContributors;
}

async function main() {
  const warnings: Warning[] = [];
  const repoPlan = buildRepoPlan();
  const index: FamousIndex = {
    generatedAt: new Date().toISOString(),
    famous: {},
    contributorToFamousRepos: {},
    repoToContributors: {},
    contributorToRepos: {},
  };

  console.log("Building expanded GitHub handshake graph...");
  console.log(`GitHub token: ${hasGitHubToken() ? "present" : "not set (low public rate limit)"}`);
  console.log(`Famous developers: ${FAMOUS_DEVS.length}`);
  console.log(`Bridge repositories: ${BRIDGE_REPOS.length}`);
  console.log(`Unique repositories to index: ${repoPlan.size}`);
  console.log(`Contributor pages per repo: ${process.env.INDEX_CONTRIBUTOR_PAGES ?? "2"}`);
  console.log("");

  index.repoToContributors = await fetchIndexedRepos(repoPlan, warnings);

  for (const [repo, repoIndex] of Object.entries(index.repoToContributors)) {
    for (const contributorLogin of repoIndex.contributors) {
      addContributorRepo(index, contributorLogin, repo);
    }
  }

  for (const dev of FAMOUS_DEVS) {
    const normalizedFamousLogin = normalizeContributorLogin(dev.login);
    index.famous[normalizedFamousLogin] = {
      login: dev.login,
      name: dev.name,
      category: dev.category,
      repos: {},
    };

    for (const repoInput of dev.anchorRepos) {
      const repo = normalizeRepoFullName(repoInput);
      const repoIndex = index.repoToContributors[repo];
      if (!repoIndex) continue;

      const contributors = Array.from(new Set(repoIndex.contributors));
      if (!contributors.map(normalizeContributorLogin).includes(normalizedFamousLogin)) {
        contributors.unshift(dev.login);
      }

      index.famous[normalizedFamousLogin].repos[repo] = {
        ...repoIndex,
        contributors,
        contributorsCount: contributors.length,
      };

      for (const contributorLogin of contributors) {
        addContributorMapping(index, contributorLogin, normalizedFamousLogin, dev.name, repo);
      }

      addContributorRepo(index, dev.login, repo);
    }
  }

  index.stats = {
    famousCount: Object.keys(index.famous).length,
    bridgeRepoCount: BRIDGE_REPOS.length,
    indexedRepoCount: Object.keys(index.repoToContributors).length,
    contributorCount: Object.keys(index.contributorToRepos ?? {}).length,
    warningCount: warnings.length,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  const serialized = `${JSON.stringify(index, null, 2)}\n`;
  await writeFile(`${outputPath}.tmp`, serialized, "utf8");
  await rename(`${outputPath}.tmp`, outputPath);

  console.log("\nIndex written:", outputPath);
  console.log("Famous developers:", index.stats.famousCount);
  console.log("Indexed repositories:", index.stats.indexedRepoCount);
  console.log("Contributor nodes:", index.stats.contributorCount);
  console.log("Contributor → famous mappings:", Object.keys(index.contributorToFamousRepos).length);
  console.log("Warnings:", warnings.length);

  if (Object.keys(index.contributorToFamousRepos).length === 0) {
    console.error("No contributor mappings were generated. Check network access or GITHUB_TOKEN.");
    process.exitCode = 1;
  }

  if (warnings.length > 0) {
    console.log("\nWarnings summary:");
    for (const warning of warnings) {
      console.log(`- ${warning.source} ${warning.repo}: ${warning.message}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
