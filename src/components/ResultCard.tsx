import { CONFIDENCE_COPY } from "../lib/confidence";
import type { HandshakeMatch, HandshakeResult } from "../lib/types";
import { ErrorMessage } from "./ErrorMessage";
import { PathGraph } from "./PathGraph";

type Props = {
  result: HandshakeResult | null;
};

function LinkText({ degrees }: { degrees: number }) {
  return <>{degrees === 1 ? "contributor link" : "contributor links"}</>;
}

function MatchRow({ match }: { match: HandshakeMatch }) {
  return (
    <article className="match-row">
      <div>
        <strong>@{match.targetLogin}</strong>
        <span>{match.targetName}{match.targetCategory ? ` · ${match.targetCategory}` : ""}</span>
      </div>
      <div className="match-row__meta">
        <span>{match.degrees} links</span>
        <span className={`confidence-dot confidence-dot--${match.confidence}`}>
          {match.confidence}
        </span>
      </div>
    </article>
  );
}

export function ResultCard({ result }: Props) {
  if (!result) {
    return (
      <section className="placeholder-card" aria-live="polite">
        <div className="placeholder-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" aria-label="Graph icon">
            <path d="M7 7h10M7 17h10M7 7l10 10M17 7 7 17" />
            <circle cx="7" cy="7" r="2.5" />
            <circle cx="17" cy="7" r="2.5" />
            <circle cx="7" cy="17" r="2.5" />
            <circle cx="17" cy="17" r="2.5" />
          </svg>
        </div>
        <h2>Map your public open-source distance</h2>
        <p>
          Add a repository hint like <code>prettier/prettier</code> for the sharpest result,
          or search by username only for a broader best-effort scan.
        </p>
      </section>
    );
  }

  if (result.status === "error") {
    return <ErrorMessage title="Could not complete the search" message={result.message} />;
  }

  if (result.status === "not_found") {
    return <ErrorMessage title="No path found in this graph" message={result.explanation} />;
  }

  const indexDate = result.indexGeneratedAt
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.indexGeneratedAt))
    : null;

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-card__topline">
        <p className="eyebrow">{result.searchMode === "closest" ? "Closest match" : "Path found"}</p>
        <span className={`confidence confidence--${result.confidence}`}>
          {result.confidence} confidence
        </span>
      </div>

      <h2>
        @{result.targetLogin} is {result.degrees} <LinkText degrees={result.degrees} /> away
      </h2>

      <p className="result-card__summary">{result.explanation}</p>

      <PathGraph path={result.path} />

      <div className="result-meta">
        <div>
          <strong>{result.hops}</strong>
          <span>graph hops</span>
        </div>
        <div>
          <strong>{result.degrees}</strong>
          <span>user-to-user links</span>
        </div>
        <div>
          <strong>{result.confidence}</strong>
          <span>{CONFIDENCE_COPY[result.confidence]}</span>
        </div>
      </div>

      {result.verifiedUserInRepo === false && (
        <p className="repo-hint-note">
          Repo hint mode: GitHub did not return the username in the checked contributor
          window. The path is useful for exploration, not proof of contribution.
        </p>
      )}

      {result.alternatives.length > 0 && (
        <div className="alternatives">
          <h3>Other close matches</h3>
          <div className="alternatives__list">
            {result.alternatives.map((match) => (
              <MatchRow key={match.targetLogin} match={match} />
            ))}
          </div>
        </div>
      )}

      {indexDate && <p className="index-date">Graph index generated {indexDate}</p>}
    </section>
  );
}
