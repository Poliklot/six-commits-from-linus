# Changelog

## 1.0.1 — 2026-10-07

### Fixed

- Excluded `codex`, `copilot`, and `cursoragent` from contributor paths using a shared exact-login denylist.
- Honored GitHub's bot account metadata in both live API requests and index generation.
- Removed known agents from the shipped index and filtered older cached graphs on load, including reverse mappings and contributor counts.
- Rejected known bot accounts as starting users with an explanatory message.

### Verified

- 16 regression tests covering cached and live routes, target and closest modes, profile scans, pagination, and preserved human paths.
- TypeScript production build and ESLint.
- Regression tests now run before deployment and scheduled index refreshes.

Thanks to [Grigory Dubrovin (@wackywildoak)](https://github.com/wackywildoak) for reporting the AI-agent shortcut problem.

## 1.0.0 — 2026-07-17

First showcase release.

### Added

- Repository Atlas interface with a responsive, code-native graph preview.
- Clear loading, empty, error, evidence, and result states.
- Copyable and URL-addressable routes.
- Expandable alternative paths with source and confidence details.
- Merged-PR verification for repository hints when contributor windows miss a user.
- Privacy and methodology ledger explaining every graph edge.
- Favicon, web app manifest, canonical metadata, and 1200×630 social preview.

### Verified

- Responsive layouts at 390, 768, 1024, and 1440 pixels.
- Closest and specific-target search modes.
- Production Pages base path and static assets.
- TypeScript build, ESLint, keyboard labels, heading order, and console output.
