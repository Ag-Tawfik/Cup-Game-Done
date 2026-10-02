# Cup-Game

[![CI](https://github.com/Ag-Tawfik/Cup-Game-Done/actions/workflows/ci.yml/badge.svg)](https://github.com/Ag-Tawfik/Cup-Game-Done/actions/workflows/ci.yml)

Cup game you can play if you get bored :)

Each cup hides a ball worth a number of GB. Every ball is shown once, the cups
are shuffled, and you pick one to win its GB.

## Requirements

Node.js 20 or newer.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

## Checks

```bash
npm run check   # lint + typecheck + unit tests
npm test        # unit tests only
```

## Build

The site is exported statically into `out/`:

```bash
npm run build
```

Serve `out/` with any static file server, for example `npx serve out`.
To host under a sub-path, set `NEXT_PUBLIC_BASE_PATH=/repo-name` when building.

## Deployment

Every push to `master` runs the checks and deploys the static export to
GitHub Pages at <https://ag-tawfik.github.io/Cup-Game-Done/> via
`.github/workflows/deploy.yml`. The repository's Pages source must be set to
"GitHub Actions" (Settings → Pages); the workflow attempts to enable this on
its first run.
