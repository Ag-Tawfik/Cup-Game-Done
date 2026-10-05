# Cup-Game

[![CI](https://github.com/Ag-Tawfik/Cup-Game-Done/actions/workflows/ci.yml/badge.svg)](https://github.com/Ag-Tawfik/Cup-Game-Done/actions/workflows/ci.yml)

Cup game you can play if you get bored :)

**Play it here: <https://ag-tawfik.github.io/Cup-Game-Done/>**

One ball goes under one cup. You see where, the cups shuffle, and you pick the
cup you think hides it. A correct pick scores points and extends your streak;
a wrong one resets the streak. Longer streaks make the shuffle faster and
longer, and pay more. Score, best score, best streak and settings are kept in
your browser.

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

`npm run check` runs lint, typecheck and unit tests. `npm run test:e2e` builds the
static export and drives it in headless Chromium (first run: `npx playwright install chromium`).

### Scripts

```bash
npm run check      # lint + typecheck + unit tests
npm test           # unit tests only
npm run test:e2e   # browser tests against the built export
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

## License

MIT. See `LICENSE`.
