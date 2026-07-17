import { useMemo, useState } from "react";
import { GraphPreview } from "./components/GraphPreview";
import { ResultCard } from "./components/ResultCard";
import { SearchForm } from "./components/SearchForm";
import { BRIDGE_REPOS } from "./data/bridge-repos";
import { FAMOUS_DEVS } from "./data/famous-devs";
import { searchHandshake } from "./lib/findHandshakePath";
import type { HandshakeResult, HandshakeSearchOptions } from "./lib/types";
import "./styles.css";

const DEFAULT_SEARCH: HandshakeSearchOptions = {
  fromLogin: "",
  contributedRepo: "",
  mode: "closest",
};

function initialSearchFromUrl(): HandshakeSearchOptions {
  if (typeof window === "undefined") return DEFAULT_SEARCH;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "target" ? "target" : "closest";

  return {
    fromLogin: params.get("user") ?? "",
    contributedRepo: params.get("repo") ?? "",
    mode,
    toFamousLogin: mode === "target" ? params.get("target") ?? undefined : undefined,
  };
}

function writeSearchToUrl(options: HandshakeSearchOptions) {
  const params = new URLSearchParams();
  const username = options.fromLogin.trim().replace(/^@+/, "");
  const repo = options.contributedRepo?.trim();

  if (username) params.set("user", username);
  if (repo) params.set("repo", repo);
  if (options.mode === "target") {
    params.set("mode", "target");
    if (options.toFamousLogin) params.set("target", options.toFamousLogin);
  }

  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z"
      />
    </svg>
  );
}

export function App() {
  const initialSearch = useMemo(initialSearchFromUrl, []);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HandshakeResult | null>(null);
  const [lastSearch, setLastSearch] = useState<HandshakeSearchOptions | null>(null);

  const stats = useMemo(() => {
    const uniqueRepos = new Set([
      ...FAMOUS_DEVS.flatMap((dev) => dev.anchorRepos),
      ...BRIDGE_REPOS.map((repo) => repo.fullName),
    ]);
    return { uniqueRepos: uniqueRepos.size };
  }, []);

  async function handleSearch(options: HandshakeSearchOptions) {
    setLoading(true);
    setResult(null);
    setLastSearch(options);
    writeSearchToUrl(options);

    try {
      setResult(await searchHandshake(options));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="top">
      <a className="skip-link" href="#route-finder">Skip to route finder</a>

      <header className="masthead section-shell">
        <a className="wordmark" href="#top" aria-label="Six Commits from Linus home">
          <span className="wordmark__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Six Commits <em>from Linus</em></span>
        </a>
        <nav className="masthead__nav" aria-label="Primary navigation">
          <a href="#method">Method</a>
          <span className="masthead__status"><i /> Public graph</span>
          <a
            className="github-link"
            href="https://github.com/Poliklot/six-commits-from-linus"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubMark />
            <span>GitHub</span>
          </a>
        </nav>
      </header>

      <section className="hero section-shell">
        <div className="hero__content">
          <p className="eyebrow">Open-source social distance</p>
          <h1>
            Find your shortest line
            <span>through open source.</span>
          </h1>
          <p className="hero__subtitle">
            Enter a GitHub handle. We trace public merged pull requests and contributor
            graphs to the maintainers and builders who shaped modern software.
          </p>
          <a className="hero__cta" href="#route-finder">
            Trace your route
            <span aria-hidden="true">↓</span>
          </a>

          <dl className="hero__metrics" aria-label="Graph coverage">
            <div><dt>{FAMOUS_DEVS.length}</dt><dd>notable developers</dd></div>
            <div><dt>{stats.uniqueRepos}</dt><dd>indexed repositories</dd></div>
            <div><dt>{BRIDGE_REPOS.length}</dt><dd>bridge repositories</dd></div>
          </dl>
        </div>
        <GraphPreview />
      </section>

      <section className="route-finder section-shell" id="route-finder" aria-labelledby="route-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Route finder</p>
            <h2 id="route-title">Start with one public signal.</h2>
          </div>
          <p>
            No sign-in, no token, no private data. A repository hint makes the route
            faster and easier to verify.
          </p>
        </div>

        <SearchForm
          famousDevs={FAMOUS_DEVS}
          initialOptions={initialSearch}
          onSearch={handleSearch}
          loading={loading}
        />
        <ResultCard result={result} loading={loading} searchOptions={lastSearch} />
      </section>

      <section className="method section-shell" id="method" aria-labelledby="method-title">
        <div className="section-heading section-heading--method">
          <div>
            <p className="eyebrow">Signal ledger</p>
            <h2 id="method-title">Every edge has a public reason.</h2>
          </div>
          <p>
            The result is an explorable lead, not a claim of personal acquaintance.
            We show what produced the route and where the approximation begins.
          </p>
        </div>

        <ol className="method__steps">
          <li>
            <span>01</span>
            <div>
              <strong>Discover a repository</strong>
              <p>A merged PR or your explicit repository hint anchors the search.</p>
              <code>is:pr is:merged author:you</code>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Cross the contributor graph</strong>
              <p>Public contributor lists connect people through repositories they touched.</p>
              <code>user → repo → user</code>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Rank the shortest route</strong>
              <p>Fewer links win; smaller contributor sets produce a stronger signal.</p>
              <code>shortest path + signal size</code>
            </div>
          </li>
        </ol>

        <div className="trust-ledger">
          <div>
            <p className="eyebrow">Privacy boundary</p>
            <h3>The browser does the work.</h3>
          </div>
          <ul>
            <li><span>Collected</span><strong>Public GitHub metadata only</strong></li>
            <li><span>Stored</span><strong>Nothing about your search</strong></li>
            <li><span>Excluded</span><strong>Private repos, OAuth, tracking</strong></li>
          </ul>
          <p className="trust-ledger__note">
            GitHub does not expose a perfect list of every contribution. Missing from this
            graph never means missing from GitHub.
          </p>
        </div>
      </section>

      <footer className="footer section-shell">
        <div>
          <strong>Six Commits from Linus</strong>
          <p>Public trails, approximate distances, transparent signals.</p>
        </div>
        <div className="footer__links">
          <a href="mailto:support@poliklot.com">support@poliklot.com</a>
          <a href="https://github.com/Poliklot/six-commits-from-linus" target="_blank" rel="noreferrer">
            Source on GitHub ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
