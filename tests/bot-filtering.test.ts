import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getRepoContributors as getIndexedContributors } from "../scripts/github";
import { excludeBotsFromIndex } from "../src/lib/famousIndex";
import { searchHandshake } from "../src/lib/findHandshakePath";
import { getRepoContributors, isLikelyBot } from "../src/lib/githubApi";
import type { FamousIndex, GitHubContributor, HandshakeResult } from "../src/lib/types";

const agents = ["copilot", "codex", "cursoragent"];
const bots = [...agents, "dependabot", "renovate", "github-actions[bot]", "test-bot", "buildbot"];

function fixture(humanBridge = false): FamousIndex {
  const bridges = humanBridge ? [...agents, "middledev"] : agents;
  const start = { contributors: ["alice", ...bridges], contributorsCount: bridges.length + 1 };
  const target = { contributors: ["torvalds", ...bridges], contributorsCount: bridges.length + 1 };
  return {
    generatedAt: "2026-09-26T12:56:00Z",
    famous: {
      torvalds: { login: "torvalds", name: "Linus Torvalds", category: "Linux", repos: { "torvalds/linux": target } },
    },
    contributorToFamousRepos: Object.fromEntries(bridges.map((login) => [login, [
      { famousLogin: "torvalds", famousName: "Linus Torvalds", repo: "torvalds/linux" },
    ]])),
    repoToContributors: { "org/start": start, "torvalds/linux": target },
    contributorToRepos: Object.fromEntries(["alice", "torvalds", ...bridges].map((login) => [login, ["org/start"]])),
    stats: { famousCount: 1, bridgeRepoCount: 1, indexedRepoCount: 2, contributorCount: bridges.length + 2, warningCount: 0 },
  };
}

function assertHumanRoute(result: HandshakeResult) {
  assert.equal(result.status, "found");
  if (result.status !== "found") return;
  assert.equal(result.degrees, 2);
  assert.deepEqual(result.path.filter((node) => node.type === "user").map((node) => node.login), ["alice", "middledev", "torvalds"]);
  for (const match of [result, ...result.alternatives]) {
    assert.ok(match.path.every((node) => node.type !== "user" || !isLikelyBot(node.login)));
  }
}

test("bot policy normalizes exact agent names, suffixes and GitHub Bot metadata", () => {
  for (const login of bots) assert.equal(isLikelyBot(` @@${login.toUpperCase()} `), true, login);
  assert.equal(isLikelyBot("automation", "Bot"), true);
  assert.equal(isLikelyBot("automation", "bot"), true);
  for (const login of ["alice", "torvalds", "claude", "devinrhode2", "codex-fan", "my-copilot", "cursoragent-user"]) {
    assert.equal(isLikelyBot(login, "User"), false, login);
  }
});

for (const [name, fetchContributors] of [["frontend", getRepoContributors], ["indexer", getIndexedContributors]] as const) {
  test(`${name} removes bots before deduplication and keeps pagination based on raw page size`, async (t) => {
    const contributor = (login: string, type = "User"): GitHubContributor => ({ login, type, id: 1, html_url: "", contributions: 1 });
    const firstPage = Array.from({ length: 100 }, () => contributor("automation", "Bot"));
    const secondPage = [...bots.map((login) => contributor(login)), contributor("alice"), contributor("ALICE"), contributor("codex-fan")];
    const calls: string[] = [];
    t.mock.method(globalThis, "fetch", async (url: string) => {
      calls.push(url);
      return Response.json(url.includes("page=1&") ? firstPage : secondPage);
    });
    const result = await fetchContributors("org/start", 2);
    assert.deepEqual(result.map((entry) => entry.login), ["alice", "codex-fan"]);
    assert.equal(calls.length, 2);
  });
}

test("old cached indexes are filtered across all graph views without mutating input", () => {
  const original = fixture(true);
  const snapshot = structuredClone(original);
  original.famous.copilot = { login: "copilot", name: "Copilot", category: "Bot", repos: {} };
  original.contributorToFamousRepos.alice = [{ famousLogin: "copilot", famousName: "Copilot", repo: "org/start" }];
  const before = structuredClone(original);
  const clean = excludeBotsFromIndex(original);
  assert.deepEqual(original, before);
  assert.deepEqual(clean.repoToContributors?.["org/start"].contributors, ["alice", "middledev"]);
  assert.equal(clean.repoToContributors?.["org/start"].contributorsCount, 2);
  assert.deepEqual(clean.famous.torvalds.repos["torvalds/linux"].contributors, ["torvalds", "middledev"]);
  assert.equal(clean.famous.torvalds.repos["torvalds/linux"].contributorsCount, 2);
  assert.equal(clean.famous.copilot, undefined);
  assert.deepEqual(clean.contributorToFamousRepos.alice, []);
  for (const login of agents) {
    assert.equal(clean.contributorToFamousRepos[login], undefined);
    assert.equal(clean.contributorToRepos?.[login], undefined);
  }
  assert.equal(clean.stats?.contributorCount, 3);
  assert.equal(clean.stats?.famousCount, 1);
  assert.equal(clean.generatedAt, snapshot.generatedAt);
  assert.deepEqual(excludeBotsFromIndex(clean), clean);
});

test("legacy index without optional graph maps remains supported", () => {
  const index = fixture(true);
  delete index.repoToContributors;
  delete index.contributorToRepos;
  delete index.stats;
  const clean = excludeBotsFromIndex(index);
  assert.equal(clean.repoToContributors, undefined);
  assert.equal(clean.contributorToRepos, undefined);
  assert.deepEqual(clean.famous.torvalds.repos["torvalds/linux"].contributors, ["torvalds", "middledev"]);
});

test("known bots cannot be starting users even when the cache contains direct routes", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("No request expected"); });
  for (const login of bots) {
    const result = await searchHandshake({ fromLogin: ` @${login.toUpperCase()} `, mode: "closest", contributedRepo: "org/start" });
    assert.equal(result.status, "error");
    if (result.status === "error") assert.match(result.message, /Bot and AI/);
  }
});

for (const mode of ["closest", "target"] as const) {
  for (const humanBridge of [false, true]) {
    test(`${mode} cached repo hint ${humanBridge ? "keeps a human bridge" : "rejects bot-only bridges"}`, async (t) => {
      t.mock.method(globalThis, "fetch", async (url: string) => {
        if (url.endsWith("famous-index.json")) return Response.json(fixture(humanBridge));
        // Search failure must not bypass the cached graph policy.
        return new Response("rate limited", { status: 403 });
      });
      const result = await searchHandshake({ fromLogin: "alice", contributedRepo: "org/start", mode, toFamousLogin: mode === "target" ? "torvalds" : undefined });
      if (humanBridge) assertHumanRoute(result);
      else assert.equal(result.status, "not_found");
    });
  }
}

for (const source of ["profile-scan", "owned-repo", "live-hint"] as const) {
  test(`${source} retains human routes while filtering agent shortcuts`, async (t) => {
    const index = fixture(true);
    if (source === "live-hint") delete index.repoToContributors?.["org/start"];
    t.mock.method(globalThis, "fetch", async (url: string) => {
      if (url.endsWith("famous-index.json")) return Response.json(index);
      if (url.includes("/search/issues")) return Response.json({ items: source === "profile-scan" ? [
        { repository_url: "https://api.github.com/repos/org/start", html_url: "https://github.com/org/start/pull/1" },
      ] : [] });
      if (url.endsWith("/users/alice")) return Response.json({ login: "alice", type: "User" });
      if (url.includes("/users/alice/repos")) return Response.json([
        { full_name: "org/start", fork: false, archived: false, stargazers_count: 1, pushed_at: null },
      ]);
      if (url.includes("/repos/org/start/contributors")) return Response.json([
        ...["alice", ...agents, "middledev"].map((login) => ({ login, type: "User" })),
        { login: "automation", type: "Bot" },
      ]);
      throw new Error(`Unexpected request: ${url}`);
    });
    const result = await searchHandshake({ fromLogin: "alice", mode: "closest", contributedRepo: source === "live-hint" ? "org/start" : undefined });
    assertHumanRoute(result);
    if (result.status === "found") assert.equal(result.source, source === "owned-repo" ? "closest" : source === "live-hint" ? "repo-hint" : "profile-scan");
  });
}

test("GitHub Bot metadata rejects an unknown bot before scanning owned repositories", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string) => {
    if (url.endsWith("famous-index.json")) return Response.json(fixture());
    if (url.includes("/search/issues")) return Response.json({ items: [] });
    if (url.endsWith("/users/automation")) return Response.json({ login: "automation", type: "Bot" });
    throw new Error(`Unexpected request: ${url}`);
  });
  const result = await searchHandshake({ fromLogin: "automation", mode: "closest" });
  assert.equal(result.status, "error");
  if (result.status === "error") assert.match(result.message, /Bot and AI/);
});

test("direct human target routes and self-target routes are unchanged", async (t) => {
  const index = fixture();
  index.famous.torvalds.repos["torvalds/linux"].contributors.push("alice");
  t.mock.method(globalThis, "fetch", async () => Response.json(index));
  const direct = await searchHandshake({ fromLogin: "alice", mode: "target", toFamousLogin: "torvalds" });
  assert.equal(direct.status, "found");
  if (direct.status === "found") assert.equal(direct.degrees, 1);
  const self = await searchHandshake({ fromLogin: "torvalds", mode: "target", toFamousLogin: "torvalds" });
  assert.equal(self.status, "found");
  if (self.status === "found") assert.equal(self.degrees, 0);
});

test("shipped static index contains no known bot nodes or reverse mappings", () => {
  const index: FamousIndex = JSON.parse(readFileSync(new URL("../public/data/famous-index.json", import.meta.url), "utf8"));
  assert.deepEqual(JSON.parse(JSON.stringify(excludeBotsFromIndex(index))), index);
});
