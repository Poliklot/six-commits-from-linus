import { useMemo, useState } from "react";
import { ResultCard } from "./components/ResultCard";
import { SearchForm } from "./components/SearchForm";
import { BRIDGE_REPOS } from "./data/bridge-repos";
import { FAMOUS_DEVS } from "./data/famous-devs";
import { searchHandshake } from "./lib/findHandshakePath";
import type { HandshakeResult, HandshakeSearchOptions } from "./lib/types";
import "./styles.css";

export function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HandshakeResult | null>(null);

  const stats = useMemo(() => {
    const anchorRepos = FAMOUS_DEVS.reduce((total, dev) => total + dev.anchorRepos.length, 0);
    const categories = new Set(FAMOUS_DEVS.map((dev) => dev.category));
    const uniqueRepos = new Set([
      ...FAMOUS_DEVS.flatMap((dev) => dev.anchorRepos),
      ...BRIDGE_REPOS.map((repo) => repo.fullName),
    ]);
    return { anchorRepos, categories: categories.size, uniqueRepos: uniqueRepos.size };
  }, []);

  async function handleSearch(options: HandshakeSearchOptions) {
    setLoading(true);
    setResult(null);
    const nextResult = await searchHandshake(options);
    setResult(nextResult);
    setLoading(false);
  }

  return (
    <main>
      <section className="hero section-shell">
        <div className="hero__content">
          <p className="eyebrow">Open-source social graph</p>
          <h1>Six Commits from Linus</h1>
          <p className="hero__subtitle">
            Scan public merged pull requests and contributor graphs to see how your
            GitHub trail connects to maintainers, language creators, framework authors,
            and developer-tool builders.
          </p>
          <div className="hero__actions" aria-label="Project facts">
            <span>{FAMOUS_DEVS.length} notable developers</span>
            <span>{stats.uniqueRepos} indexed repositories</span>
            <span>{BRIDGE_REPOS.length} bridge repos</span>
          </div>
        </div>
        <aside className="hero__panel" aria-label="Example path">
          <div className="terminal-card">
            <div className="terminal-card__bar">
              <span />
              <span />
              <span />
            </div>
            <pre>{`@you
  -> prettier/prettier
@vjeux

1 contributor link
strong signal`}</pre>
          </div>
        </aside>
      </section>

      <section className="workspace section-shell" aria-label="Search workspace">
        <SearchForm famousDevs={FAMOUS_DEVS} onSearch={handleSearch} loading={loading} />
        <ResultCard result={result} />
      </section>

      <section className="proof-strip section-shell" aria-label="Built for GitHub public data">
        <div>
          <strong>Static by design</strong>
          <span>Runs on GitHub Pages. No backend, no database, no accounts.</span>
        </div>
        <div>
          <strong>Public data only</strong>
          <span>Uses public PR search and repository contributors from GitHub REST API.</span>
        </div>
        <div>
          <strong>Profile Scan</strong>
          <span>Finds merged public PRs first; repo hints still give the sharpest path.</span>
        </div>
      </section>

      <section className="info-grid section-shell" aria-label="How the app works">
        <article>
          <h2>How it works</h2>
          <p>
            The app indexes public contributors from high-signal open-source repositories.
            For username-only searches, it also scans public merged pull requests authored
            by that GitHub login and matches those repositories against the graph.
          </p>
        </article>
        <article>
          <h2>Why repo hints still help</h2>
          <p>
            GitHub does not expose a perfect public endpoint for every contribution. A
            repo hint lets the graph start from a known project like
            <code> prettier/prettier</code> or <code>vitejs/vite</code> without spending
            extra unauthenticated API quota.
          </p>
        </article>
        <article>
          <h2>Accuracy</h2>
          <p>
            Results are approximate and based on contributor windows returned by GitHub.
            The app does not use private repositories, OAuth scopes, followers, stars, or
            pull request reviews.
          </p>
        </article>
      </section>

      <footer className="footer section-shell">
        <p>No login. No tracking. Public GitHub data only. Support: support@poliklot.com</p>
        <a href="https://github.com/Poliklot/six-commits-from-linus" target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </footer>
    </main>
  );
}
