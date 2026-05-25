import { FAMOUS_DEVS } from "../src/data/famous-devs";
import {
  getRepoContributors,
  getRepository,
  getUser,
  GitHubScriptError,
  hasGitHubToken,
} from "./github";

type Summary = {
  validUsers: number;
  validRepos: number;
  totalUsers: number;
  totalRepos: number;
  warnings: number;
};

function describeError(error: unknown): string {
  if (error instanceof GitHubScriptError) {
    return `${error.status} ${error.code}`;
  }

  return error instanceof Error ? error.message : "unknown error";
}

async function validateDev(dev: (typeof FAMOUS_DEVS)[number]): Promise<{
  userValid: boolean;
  validRepos: number;
  warnings: number;
}> {
  let userValid = false;
  let validRepos = 0;
  let warnings = 0;

  try {
    await getUser(dev.login);
    userValid = true;
    console.log(`✅ ${dev.login}`);
  } catch (error) {
    warnings += 1;
    console.log(`⚠️ ${dev.login}`);
    console.log(`  ⚠️ user lookup failed: ${describeError(error)}`);
  }

  for (const repo of dev.anchorRepos) {
    try {
      await getRepository(repo);
      const contributors = await getRepoContributors(repo);

      if (contributors.length === 0) {
        warnings += 1;
        console.log(`  ⚠️ ${repo} contributors: 0`);
        continue;
      }

      validRepos += 1;
      console.log(`  ✅ ${repo} contributors: ${contributors.length}`);
    } catch (error) {
      warnings += 1;
      console.log(`  ⚠️ ${repo} returned ${describeError(error)}`);
    }
  }

  return { userValid, validRepos, warnings };
}

async function main() {
  const summary: Summary = {
    validUsers: 0,
    validRepos: 0,
    totalUsers: FAMOUS_DEVS.length,
    totalRepos: FAMOUS_DEVS.reduce((sum, dev) => sum + dev.anchorRepos.length, 0),
    warnings: 0,
  };

  console.log("Validating famous developers...");
  console.log(`GitHub token: ${hasGitHubToken() ? "present" : "not set (low public rate limit)"}\n`);

  for (const dev of FAMOUS_DEVS) {
    const result = await validateDev(dev);
    if (result.userValid) summary.validUsers += 1;
    summary.validRepos += result.validRepos;
    summary.warnings += result.warnings;
    console.log("");
  }

  console.log(`Valid users: ${summary.validUsers}/${summary.totalUsers}`);
  console.log(`Valid repos: ${summary.validRepos}/${summary.totalRepos}`);
  console.log(`Warnings: ${summary.warnings}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
