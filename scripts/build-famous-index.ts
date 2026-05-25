import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { FAMOUS_DEVS } from "../src/data/famous-devs";
import type { FamousIndex } from "../src/lib/types";
import {
  getRepoContributors,
  GitHubScriptError,
  hasGitHubToken,
  normalizeContributorLogin,
} from "./github";

const outputPath = resolve("public/data/famous-index.json");

type Warning = {
  dev: string;
  repo: string;
  message: string;
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

async function main() {
  const warnings: Warning[] = [];
  const index: FamousIndex = {
    generatedAt: new Date().toISOString(),
    famous: {},
    contributorToFamousRepos: {},
  };

  console.log("Building famous index...");
  console.log(`GitHub token: ${hasGitHubToken() ? "present" : "not set (low public rate limit)"}`);

  for (const dev of FAMOUS_DEVS) {
    const normalizedFamousLogin = normalizeContributorLogin(dev.login);
    console.log(`\n${dev.name} (@${dev.login})`);

    index.famous[normalizedFamousLogin] = {
      login: dev.login,
      name: dev.name,
      category: dev.category,
      repos: {},
    };

    for (const repo of dev.anchorRepos) {
      try {
        const contributors = await getRepoContributors(repo);
        const contributorLogins = contributors.map((contributor) => contributor.login);

        index.famous[normalizedFamousLogin].repos[repo] = {
          contributors: contributorLogins,
          contributorsCount: contributorLogins.length,
        };

        for (const contributorLogin of contributorLogins) {
          addContributorMapping(
            index,
            contributorLogin,
            normalizedFamousLogin,
            dev.name,
            repo,
          );
        }

        if (!contributorLogins.map(normalizeContributorLogin).includes(normalizedFamousLogin)) {
          addContributorMapping(index, dev.login, normalizedFamousLogin, dev.name, repo);
          index.famous[normalizedFamousLogin].repos[repo].contributors.unshift(dev.login);
          index.famous[normalizedFamousLogin].repos[repo].contributorsCount += 1;
        }

        console.log(`  ✅ ${repo} contributors: ${contributorLogins.length}`);
      } catch (error) {
        const message =
          error instanceof GitHubScriptError
            ? `${error.status} ${error.code}`
            : error instanceof Error
              ? error.message
              : "unknown error";
        warnings.push({ dev: dev.login, repo, message });
        console.warn(`  ⚠️ ${repo} ${message}`);
      }
    }
  }

  await mkdir(dirname(outputPath), { recursive: true });
  const serialized = `${JSON.stringify(index, null, 2)}\n`;
  await writeFile(`${outputPath}.tmp`, serialized, "utf8");
  await rename(`${outputPath}.tmp`, outputPath);

  console.log("\nIndex written:", outputPath);
  console.log("Famous developers:", Object.keys(index.famous).length);
  console.log("Contributor mappings:", Object.keys(index.contributorToFamousRepos).length);
  console.log("Warnings:", warnings.length);

  if (Object.keys(index.contributorToFamousRepos).length === 0) {
    console.error("No contributor mappings were generated. Check network access or GITHUB_TOKEN.");
    process.exitCode = 1;
  }

  if (warnings.length > 0) {
    console.log("\nWarnings summary:");
    for (const warning of warnings) {
      console.log(`- @${warning.dev} ${warning.repo}: ${warning.message}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
