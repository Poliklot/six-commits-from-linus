import { FormEvent, useId, useState } from "react";
import type { FamousDev } from "../data/famous-devs";
import { FamousSelect } from "./FamousSelect";

type Props = {
  famousDevs: FamousDev[];
  onSearch: (username: string, famousLogin: string) => void;
  loading: boolean;
};

export function SearchForm({ famousDevs, onSearch, loading }: Props) {
  const usernameId = useId();
  const [username, setUsername] = useState("");
  const [famousLogin, setFamousLogin] = useState(famousDevs[0]?.login ?? "torvalds");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(username, famousLogin);
  }

  return (
    <form className="search-card" onSubmit={submit}>
      <div className="search-card__header">
        <p className="eyebrow">MVP search</p>
        <h2>Find your open-source connection</h2>
        <p>
          Enter a public GitHub username and choose one target from our curated list of
          famous developers.
        </p>
      </div>

      <div className="form-grid">
        <label className="field" htmlFor={usernameId}>
          <span>GitHub username</span>
          <input
            id={usernameId}
            type="text"
            inputMode="text"
            placeholder="akeilajavius"
            autoComplete="off"
            value={username}
            disabled={loading}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <FamousSelect
          famousDevs={famousDevs}
          value={famousLogin}
          disabled={loading}
          onChange={setFamousLogin}
        />
      </div>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Searching public GitHub data…" : "Find my handshake"}
      </button>
    </form>
  );
}
