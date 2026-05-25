import { FormEvent, useId, useState } from "react";
import type { FamousDev } from "../data/famous-devs";
import type { HandshakeSearchOptions } from "../lib/types";
import { FamousSelect } from "./FamousSelect";

type Props = {
  famousDevs: FamousDev[];
  onSearch: (options: HandshakeSearchOptions) => void;
  loading: boolean;
};

type Example = {
  label: string;
  username: string;
  repo: string;
  mode: "target" | "closest";
  target: string;
};

const EXAMPLES: Example[] = [
  {
    label: "Prettier path",
    username: "vjeux",
    repo: "prettier/prettier",
    mode: "closest",
    target: "vjeux",
  },
  {
    label: "React ecosystem",
    username: "gaearon",
    repo: "facebook/react",
    mode: "closest",
    target: "gaearon",
  },
  {
    label: "Vite graph",
    username: "antfu",
    repo: "vitejs/vite",
    mode: "closest",
    target: "antfu",
  },
];

export function SearchForm({ famousDevs, onSearch, loading }: Props) {
  const usernameId = useId();
  const repoId = useId();
  const [username, setUsername] = useState("");
  const [contributedRepo, setContributedRepo] = useState("");
  const [mode, setMode] = useState<"target" | "closest">("closest");
  const [famousLogin, setFamousLogin] = useState(famousDevs[0]?.login ?? "torvalds");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({
      fromLogin: username,
      contributedRepo,
      mode,
      toFamousLogin: mode === "target" ? famousLogin : undefined,
    });
  }

  function applyExample(example: Example) {
    setUsername(example.username);
    setContributedRepo(example.repo);
    setMode(example.mode);
    setFamousLogin(example.target);
  }

  return (
    <form className="search-card" onSubmit={submit}>
      <div className="search-card__header">
        <p className="eyebrow">Public GitHub graph</p>
        <h2>Start with a username. Profile Scan will look for public merged PRs.</h2>
        <p>
          If you also add a repo you touched, the search becomes deterministic: formatter,
          framework, runtime, docs repo, or any open-source project with public contributors.
        </p>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Search mode">
        <button
          className={mode === "closest" ? "mode-switch__button is-active" : "mode-switch__button"}
          type="button"
          role="tab"
          aria-selected={mode === "closest"}
          onClick={() => setMode("closest")}
        >
          Find closest
        </button>
        <button
          className={mode === "target" ? "mode-switch__button is-active" : "mode-switch__button"}
          type="button"
          role="tab"
          aria-selected={mode === "target"}
          onClick={() => setMode("target")}
        >
          Pick a target
        </button>
      </div>

      <div className="form-grid">
        <label className="field" htmlFor={usernameId}>
          <span>GitHub username</span>
          <input
            id={usernameId}
            type="text"
            inputMode="text"
            placeholder="your-login"
            autoComplete="off"
            value={username}
            disabled={loading}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label className="field" htmlFor={repoId}>
          <span>Repo you contributed to</span>
          <input
            id={repoId}
            type="text"
            inputMode="text"
            placeholder="prettier/prettier"
            autoComplete="off"
            value={contributedRepo}
            disabled={loading}
            onChange={(event) => setContributedRepo(event.target.value)}
          />
          <small>
            Optional, but strongest. Without it, Profile Scan uses public merged PRs by
            this username and checks them against the cached graph.
          </small>
        </label>

        {mode === "target" && (
          <FamousSelect
            famousDevs={famousDevs}
            value={famousLogin}
            disabled={loading}
            onChange={setFamousLogin}
          />
        )}
      </div>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Scanning public contribution trail…" : mode === "closest" ? "Find closest developers" : "Find this path"}
      </button>

      <div className="example-row" aria-label="Example searches">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            className="example-chip"
            onClick={() => applyExample(example)}
            disabled={loading}
          >
            <span>{example.label}</span>
            <code>{example.repo}</code>
          </button>
        ))}
      </div>
    </form>
  );
}
