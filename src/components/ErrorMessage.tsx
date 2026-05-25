type Props = {
  title?: string;
  message: string;
};

export function ErrorMessage({ title = "Something went wrong", message }: Props) {
  return (
    <section className="error-card" role="alert" aria-live="assertive">
      <div className="error-card__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
        <h2>{title}</h2>
        <p>{message}</p>
        <ul>
          <li>Add a repository hint such as prettier/prettier or vitejs/vite.</li>
          <li>Try “Find closest” instead of targeting one developer.</li>
          <li>Remember: absence in this graph is not absence on GitHub.</li>
        </ul>
      </div>
    </section>
  );
}
