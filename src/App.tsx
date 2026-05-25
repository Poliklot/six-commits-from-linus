import { useMemo, useState } from "react";
import { ResultCard } from "./components/ResultCard";
import { SearchForm } from "./components/SearchForm";
import { FAMOUS_DEVS } from "./data/famous-devs";
import { findHandshakePath } from "./lib/findHandshakePath";
import type { HandshakeResult } from "./lib/types";
import "./styles.css";

export function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HandshakeResult | null>(null);

  const stats = useMemo(() => {
    const repos = FAMOUS_DEVS.reduce((total, dev) => total + dev.anchorRepos.length, 0);
    const categories = new Set(FAMOUS_DEVS.map((dev) => dev.category));
    return { repos, categories: categories.size };
  }, []);

  async function handleSearch(username: string, famousLogin: string) {
    setLoading(true);
    setResult(null);
    const nextResult = await findHandshakePath(username, famousLogin);
    setResult(nextResult);
    setLoading(false);
  }

  return (
    <main>
      <section className="hero section-shell">
        <div className="hero__content">
          <p className="eyebrow">GitHub Handshake MVP</p>
          <h1>Six Commits from Linus</h1>
          <p className="hero__subtitle">
            Find how many open-source degrees separate you from famous GitHub
            developers.
          </p>
          <div className="hero__actions" aria-label="Project facts">
            <span>{FAMOUS_DEVS.length} famous developers</span>
            <span>{stats.repos} anchor repositories</span>
            <span>{stats.categories} categories</span>
          </div>
        </div>
        <aside className="hero__panel" aria-label="Example result">
          <p>@akeilajavius</p>
          <span>→ contributed to</span>
          <p>example/project</p>
          <span>→ shared with</span>
          <p>@middledev</p>
          <span>→ appears in</span>
          <p>torvalds/linux</p>
          <span>→ connected to</span>
          <p>@torvalds</p>
        </aside>
      </section>

      <section className="workspace section-shell" aria-label="Search workspace">
        <SearchForm famousDevs={FAMOUS_DEVS} onSearch={handleSearch} loading={loading} />
        <ResultCard result={result} />
      </section>

      <section className="info-grid section-shell" aria-label="How the app works">
        <article>
          <h2>How it works</h2>
          <p>
            We use public GitHub repository contributor data. You enter your GitHub
            username, then we compare your public contributor graph with a precomputed
            graph of famous open-source developers.
          </p>
        </article>
        <article>
          <h2>What counts as a handshake?</h2>
          <p>
            Two users are connected when both appear as contributors of the same public
            GitHub repository. The MVP searches your public owner repositories and the
            cached anchor repositories for the selected famous developer.
          </p>
        </article>
        <article>
          <h2>Limitations</h2>
          <p>
            This is an approximation. It does not use issues, PR reviews, stars,
            followers, private repositories, OAuth, or full GitHub graph search.
          </p>
        </article>
      </section>

      <footer className="footer section-shell">
        <p>
          No login. No backend. No database. No tracking. Only public GitHub data.
        </p>
        <a href="https://github.com/Poliklot/six-commits-from-linus" target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </footer>
    </main>
  );
}
