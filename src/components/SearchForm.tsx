import { FormEvent, useId, useState } from "react";
import type { FamousDev } from "../data/famous-devs";
import type { HandshakeSearchOptions } from "../lib/types";
import { FamousSelect } from "./FamousSelect";

type Props = {
  famousDevs: FamousDev[];
  initialOptions: HandshakeSearchOptions;
  onSearch: (options: HandshakeSearchOptions) => void;
  loading: boolean;
};

type Example = {
  label: string;
  username: string;
  repo: string;
  target: string;
};

const EXAMPLES: Example[] = [
  { label: "Prettier", username: "poliklot", repo: "prettier/prettier", target: "vjeux" },
  { label: "React", username: "gaearon", repo: "facebook/react", target: "gaearon" },
  { label: "Vite", username: "antfu", repo: "vitejs/vite", target: "antfu" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function SearchForm({ famousDevs, initialOptions, onSearch, loading }: Props) {
  const usernameId = useId();
  const repoId = useId();
  const repoHintId = useId();
  const [username, setUsername] = useState(initialOptions.fromLogin);
  const [contributedRepo, setContributedRepo] = useState(initialOptions.contributedRepo ?? "");
  const [mode, setMode] = useState<"target" | "closest">(initialOptions.mode);
  const [famousLogin, setFamousLogin] = useState(
    initialOptions.toFamousLogin ?? famousDevs[0]?.login ?? "torvalds",
  );

  function optionsFromState(): HandshakeSearchOptions {
    return {
      fromLogin: username,
      contributedRepo,
      mode,
      toFamousLogin: mode === "target" ? famousLogin : undefined,
    };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(optionsFromState());
  }

  function applyExample(example: Example) {
    const options: HandshakeSearchOptions = {
      fromLogin: example.username,
      contributedRepo: example.repo,
      mode: "closest",
    };

    setUsername(example.username);
    setContributedRepo(example.repo);
    setMode("closest");
    setFamousLogin(example.target);
    onSearch(options);
  }

  return (
    <form className="search-console" data-testid="route-search" onSubmit={submit}>
      <div className="search-console__mode" role="group" aria-label="Route destination">
        <span>Destination</span>
        <button
          className={mode === "closest" ? "mode-button is-active" : "mode-button"}
          type="button"
          aria-pressed={mode === "closest"}
          disabled={loading}
          onClick={() => setMode("closest")}
        >
          Closest notable developer
        </button>
        <button
          className={mode === "target" ? "mode-button is-active" : "mode-button"}
          type="button"
          aria-pressed={mode === "target"}
          disabled={loading}
          onClick={() => setMode("target")}
        >
          A specific developer
        </button>
      </div>

      <div className={`search-console__fields${mode === "target" ? " has-target" : ""}`}>
        <label className="field field--handle" htmlFor={usernameId}>
          <span className="field__label"><b>01</b> Your GitHub handle</span>
          <div className="input-shell input-shell--handle">
            <span aria-hidden="true">@</span>
            <input
              id={usernameId}
              type="text"
              inputMode="text"
              placeholder="your-login"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              disabled={loading}
              required
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
        </label>

        <label className="field field--repo" htmlFor={repoId}>
          <span className="field__label">
            <b>02</b> Repository hint <em>optional</em>
          </span>
          <div className="input-shell">
            <input
              id={repoId}
              type="text"
              inputMode="text"
              placeholder="owner/repository"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby={repoHintId}
              value={contributedRepo}
              disabled={loading}
              onChange={(event) => setContributedRepo(event.target.value)}
            />
          </div>
          <small id={repoHintId}>Improves precision and avoids extra live API calls.</small>
        </label>

        {mode === "target" && (
          <FamousSelect
            famousDevs={famousDevs}
            value={famousLogin}
            disabled={loading}
            onChange={setFamousLogin}
          />
        )}

        <button className="trace-button" type="submit" disabled={loading}>
          {loading ? <span className="button-spinner" aria-hidden="true" /> : <SearchIcon />}
          <span>{loading ? "Tracing public signals…" : "Trace my route"}</span>
        </button>
      </div>

      <div className="search-console__footer">
        <span>Try a verified route</span>
        <div className="example-row" aria-label="Example routes">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              className="example-chip"
              onClick={() => applyExample(example)}
              disabled={loading}
            >
              <strong>{example.label}</strong>
              <code>{example.username} → {example.repo}</code>
            </button>
          ))}
        </div>
        <p><span className="status-dot" aria-hidden="true" /> Browser-only · nothing stored</p>
      </div>
    </form>
  );
}
