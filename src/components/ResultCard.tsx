import { useEffect, useState } from "react";
import { CONFIDENCE_COPY } from "../lib/confidence";
import type { HandshakeMatch, HandshakeResult, HandshakeSearchOptions, PathNode } from "../lib/types";
import { ErrorMessage } from "./ErrorMessage";
import { PathGraph } from "./PathGraph";

type Props = {
  result: HandshakeResult | null;
  loading: boolean;
  searchOptions: HandshakeSearchOptions | null;
};

const SIGNAL_COPY: Record<HandshakeMatch["source"], string> = {
  "cached-index": "cached contributor graph",
  closest: "owned repository scan",
  "profile-scan": "merged pull request",
  "repo-hint": "repository hint",
  target: "target contributor graph",
};

function nodeLabel(node: PathNode): string {
  return node.type === "user" ? `@${node.login}` : node.fullName;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function MatchRow({ match }: { match: HandshakeMatch }) {
  return (
    <details className="match-row">
      <summary>
        <span className="match-row__identity">
          <strong>@{match.targetLogin}</strong>
          <small>{match.targetName}{match.targetCategory ? ` · ${match.targetCategory}` : ""}</small>
        </span>
        <span className="match-row__meta">
          <span>{match.degrees} {match.degrees === 1 ? "link" : "links"}</span>
          <span className={`confidence-dot confidence-dot--${match.confidence}`}>
            {match.confidence}
          </span>
          <i aria-hidden="true">⌄</i>
        </span>
      </summary>
      <div className="match-row__route">
        <p>{match.explanation}</p>
        <PathGraph path={match.path} compact />
      </div>
    </details>
  );
}

function EmptyRoute() {
  return (
    <section className="result-stage result-stage--empty" data-testid="route-result" aria-live="polite">
      <div className="result-stage__header">
        <span>Route canvas</span>
        <code>waiting_for_signal</code>
      </div>
      <div className="empty-route">
        <div className="empty-route__map" aria-hidden="true">
          <span className="empty-node empty-node--start">@you</span>
          <i />
          <span className="empty-node empty-node--repo">owner/repo</span>
          <i />
          <span className="empty-node empty-node--target">@maintainer</span>
        </div>
        <div className="empty-route__copy">
          <p className="eyebrow">Ready when you are</p>
          <h3>Your route will appear here.</h3>
          <p>
            Start with a handle. Add a repository only when you want a faster,
            more explicit signal.
          </p>
          <ul>
            <li><span>1</span> Scan merged public PRs</li>
            <li><span>2</span> Match indexed contributors</li>
            <li><span>3</span> Rank the shortest routes</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function LoadingRoute({ username }: { username?: string }) {
  return (
    <section className="result-stage result-stage--loading" data-testid="route-result" aria-live="polite" aria-busy="true">
      <div className="result-stage__header">
        <span>Tracing route</span>
        <code>public_data_only</code>
      </div>
      <div className="loading-route">
        <div className="loading-route__orb" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">Searching the public graph</p>
        <h3>Mapping {username ? `@${username.replace(/^@+/, "")}` : "this profile"}.</h3>
        <p>Checking contribution signals, graph intersections, and route strength.</p>
        <div className="loading-route__rail" aria-hidden="true"><span /></div>
        <ul aria-label="Search stages">
          <li><i />Discover repositories</li>
          <li><i />Cross-reference contributors</li>
          <li><i />Rank shortest routes</li>
        </ul>
      </div>
    </section>
  );
}

export function ResultCard({ result, loading, searchOptions }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    setCopyState("idle");
  }, [result]);

  if (loading) return <LoadingRoute username={searchOptions?.fromLogin} />;
  if (!result) return <EmptyRoute />;

  if (result.status === "error") {
    return <ErrorMessage title="The route could not be completed" message={result.message} />;
  }

  if (result.status === "not_found") {
    return <ErrorMessage title="No route in the current graph" message={result.explanation} />;
  }

  const foundResult = result;
  const indexDate = result.indexGeneratedAt
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(result.indexGeneratedAt))
    : null;

  async function copyRoute() {
    const text = [
      foundResult.path.map(nodeLabel).join(" → "),
      `${foundResult.degrees} contributor ${foundResult.degrees === 1 ? "link" : "links"} · ${foundResult.confidence} signal`,
      window.location.href,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section className="result-card" data-testid="route-result" aria-live="polite">
      <div className="result-stage__header">
        <span>Resolved route</span>
        <code>{SIGNAL_COPY[result.source].replaceAll(" ", "_")}</code>
      </div>

      <div className="result-card__hero">
        <div className="result-score" aria-label={`${result.degrees} contributor ${result.degrees === 1 ? "link" : "links"}`}>
          <strong>{result.degrees}</strong>
          <span>{result.degrees === 1 ? "contributor link" : "contributor links"}</span>
        </div>
        <div className="result-card__title">
          <p className="eyebrow">{result.searchMode === "closest" ? "Closest match" : "Target reached"}</p>
          <h2>@{result.targetLogin}</h2>
          <p>{result.targetName}{result.targetCategory ? ` · ${result.targetCategory}` : ""}</p>
        </div>
        <div className="result-card__actions">
          <button className="secondary-button" type="button" onClick={copyRoute}>
            <CopyIcon />
            {copyState === "copied" ? "Route copied" : copyState === "failed" ? "Copy failed" : "Copy route"}
          </button>
          <a
            className="secondary-button secondary-button--link"
            href={`https://github.com/${result.targetLogin}`}
            target="_blank"
            rel="noreferrer"
          >
            Open profile <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <p className="result-card__summary">{result.explanation}</p>

      <PathGraph path={result.path} />

      <dl className="result-meta">
        <div>
          <dt>Signal</dt>
          <dd className={`signal-value signal-value--${result.confidence}`}>{result.confidence}</dd>
          <p>{CONFIDENCE_COPY[result.confidence]}</p>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{SIGNAL_COPY[result.source]}</dd>
          <p>{result.verifiedUserInRepo === false ? "Repository hint, not contributor proof." : "Backed by a public graph signal."}</p>
        </div>
        <div>
          <dt>Graph depth</dt>
          <dd>{result.hops} {result.hops === 1 ? "hop" : "hops"}</dd>
          <p>{indexDate ? `Index refreshed ${indexDate}.` : "Live and cached public data."}</p>
        </div>
      </dl>

      {(result.verifiedUserInRepo === false || result.source === "profile-scan") && (
        <div className="evidence-note">
          <strong>{result.verifiedUserInRepo === false ? "Exploratory route" : "How this route started"}</strong>
          <p>
            {result.verifiedUserInRepo === false
              ? "The supplied repository connects to this graph, but the checked contributor window did not include the username. Treat the route as a lead, not proof."
              : "A merged public pull request connected the username to the first repository; the cached contributor graph produced the remaining route."}
          </p>
        </div>
      )}

      {result.alternatives.length > 0 && (
        <div className="alternatives">
          <div className="alternatives__heading">
            <div>
              <p className="eyebrow">Nearby in the graph</p>
              <h3>Other short routes</h3>
            </div>
            <span>{result.alternatives.length} matches</span>
          </div>
          <div className="alternatives__list">
            {result.alternatives.map((match) => (
              <MatchRow key={match.targetLogin} match={match} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
