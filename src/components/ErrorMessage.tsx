type Props = {
  title?: string;
  message: string;
};

export function ErrorMessage({ title = "Something went wrong", message }: Props) {
  return (
    <section className="error-card" role="alert" aria-live="assertive">
      <div className="error-card__icon">!</div>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
        <ul>
          <li>Try another famous developer.</li>
          <li>Try a GitHub account with public repositories.</li>
          <li>If you are developing locally, refresh the famous index with a GitHub token.</li>
        </ul>
      </div>
    </section>
  );
}
