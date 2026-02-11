# Stow API Emulator

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/StowRocks/StowApiEmulator)

GraphQL API emulator for [Stow](https://stow.rocks), using TMDB as data source. This public API enables the Stow app to run on Vercel's free tier for demo and development purposes.

## Setup

```bash
npm install
cp .env.example .env
# Add your TMDB API key to .env
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Git Workflow

This project uses **Conventional Commits** enforced via pre-commit hooks.

### Commit Format

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples:**

- `feat(api): add TMDB search endpoint`
- `fix(resolvers): handle null movie results`
- `docs: update setup instructions`

### Pre-commit Checks

Automatically runs on every commit:

- Prettier formatting check
- ESLint linting
- Jest tests

To manually run checks:

```bash
npm run lint
npm run format
npm test
```

test
