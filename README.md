# Six Commits from Linus

Find how many open-source degrees separate you from famous GitHub developers.

**Live demo:** https://poliklot.github.io/six-commits-from-linus/

Six Commits from Linus is a static GitHub Pages MVP. A user enters a public GitHub username, chooses a famous open-source developer from a curated list, and the app searches for a public contributor path through repositories.

## Screenshot

Coming soon after the first GitHub Pages deployment.

## How it works

The MVP avoids building the whole GitHub graph.

1. `src/data/famous-devs.ts` contains 50 curated famous GitHub accounts.
2. Each famous developer has a small set of `anchorRepos`.
3. `npm run build:index` fetches up to 100 public contributors for every anchor repository.
4. The script writes `public/data/famous-index.json`.
5. The frontend loads that static JSON and makes limited public GitHub REST API calls for the input username.
6. A connection exists when two users appear as contributors of the same public repository.

Example path:

```text
@me
  → my/repo
@middledev
  → torvalds/linux
@torvalds
```

## Local setup

```bash
npm install
cp .env.example .env
npm run build:index
npm run dev
```

Open the local Vite URL printed by the dev server.

## Build

```bash
npm run build
npm run preview
```

## Validate the famous developer seed list

```bash
npm run validate:famous
```

The validator checks:

- each famous GitHub user;
- each anchor repository;
- whether the contributors endpoint returns a non-empty list.

Bad repositories are reported as warnings so one 404/403 does not break the whole run.

## Building the famous index

```bash
npm run build:index
```

For best results, create `.env` locally and set:

```text
GITHUB_TOKEN=ghp_xxx
```

The token is used only by Node.js scripts. It is never bundled into frontend code.

## Deploying to GitHub Pages

The project includes `.github/workflows/deploy.yml`.

1. Push the repository to GitHub.
2. In repository settings, enable GitHub Pages with GitHub Actions as the source.
3. Push to `main`.
4. The workflow builds Vite and deploys `dist` to Pages.

The Vite base path is derived from `GITHUB_REPOSITORY`, so the app works as a project site:

```text
https://poliklot.github.io/six-commits-from-linus/
```

## Refreshing the index

`.github/workflows/refresh-famous-index.yml` can be run manually or weekly. It uses the built-in Actions `GITHUB_TOKEN`, runs `npm run build:index`, and commits an updated `public/data/famous-index.json` if it changed.

## Privacy

This app only uses public GitHub data.

- It does not store your username.
- It does not access private repositories.
- It does not require GitHub login.
- It has no backend server.
- It has no database.
- It has no analytics or tracking.

## Token safety

Never expose your GitHub token in frontend code.

Safe places for `GITHUB_TOKEN`:

- local `.env` used by Node.js scripts;
- GitHub Actions environment variables;
- private CI secrets.

Unsafe places:

- `src/**` frontend code;
- `public/**` files;
- committed `.env` files;
- screenshots, logs, README snippets with real token values.

## Limitations

This is an approximation. It only uses public repository contributor data. It does not use:

- issues;
- pull request reviews;
- stars;
- followers;
- private repositories;
- full GitHub graph search;
- OAuth-authenticated user data.

No path found inside the MVP graph does **not** mean no real GitHub connection exists.

## Non-goals for the MVP

- OAuth login;
- backend;
- database;
- full graph crawler;
- share cards;
- PNG export;
- analytics;
- monetization.
