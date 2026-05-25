import { CONFIDENCE_COPY } from "../lib/confidence";
import type { HandshakeResult } from "../lib/types";
import { ErrorMessage } from "./ErrorMessage";
import { PathGraph } from "./PathGraph";

type Props = {
  result: HandshakeResult | null;
};

export function ResultCard({ result }: Props) {
  if (!result) {
    return (
      <section className="placeholder-card" aria-live="polite">
        <div className="placeholder-icon">⌁</div>
        <h2>Your result will appear here</h2>
        <p>
          We will compare your public repositories with a precomputed graph of famous
          open-source developers.
        </p>
      </section>
    );
  }

  if (result.status === "error") {
    return <ErrorMessage title="Could not complete the search" message={result.message} />;
  }

  if (result.status === "not_found") {
    return <ErrorMessage title="No path found inside the MVP graph" message={result.explanation} />;
  }

  const contributorText = result.degrees === 1 ? "contributor link" : "contributor links";

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-card__topline">
        <p className="eyebrow">Connection found</p>
        <span className={`confidence confidence--${result.confidence}`}>
          {result.confidence} confidence
        </span>
      </div>

      <h2>
        Connected to @{result.targetLogin} through {result.degrees} {contributorText}
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
          <span>user-to-user degrees</span>
        </div>
        <div>
          <strong>{result.confidence}</strong>
          <span>{CONFIDENCE_COPY[result.confidence]}</span>
        </div>
      </div>
    </section>
  );
}
