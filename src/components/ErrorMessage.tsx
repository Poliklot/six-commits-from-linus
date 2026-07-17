type Props = {
  title?: string;
  message: string;
};

export function ErrorMessage({ title = "The route stopped", message }: Props) {
  return (
    <section className="result-stage error-card" data-testid="route-result" role="alert" aria-live="assertive">
      <div className="result-stage__header">
        <span>Route interrupted</span>
        <code>recoverable_error</code>
      </div>
      <div className="error-card__body">
        <div className="error-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M10.3 4.7 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="eyebrow">No dead end</p>
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="error-card__suggestions">
            <strong>Try next</strong>
            <ul>
              <li>Check the GitHub handle for spelling.</li>
              <li>Add a repository hint such as <code>prettier/prettier</code>.</li>
              <li>Use “Closest notable developer” for a broader search.</li>
            </ul>
          </div>
          <p className="error-card__caveat">
            Absence in this graph is never evidence of absence on GitHub.
          </p>
        </div>
      </div>
    </section>
  );
}
