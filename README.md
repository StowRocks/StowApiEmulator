# Stow API Emulator

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/StowRocks/StowApiEmulator)

GraphQL API emulator for [Stow](https://stow.rocks), using TMDB as data source. This public API enables the Stow app to run on Vercel's free tier for demo and development purposes.

## Features

- **Read-only TMDB data**: Scenes and performers from 20 popular TV shows
- **Mutations**: Update ratings and favorites
- **Persistence**: Optional Postgres (Neon) or in-memory cache
- **GraphQL**: Compatible with Stash schema

## Setup

```bash
npm install
cp .env.example .env
# Add your TMDB API key to .env
```

## Environment Variables

Required:

- `TMDB_API_KEY` - TMDB API key
- `TMDB_API_TOKEN` - TMDB Bearer token
- `ALLOWED_TMDB_IDS` - Comma-separated TV show IDs

Optional:

- `DATABASE_URL` - Neon Postgres connection string (enables persistence)

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Mutations

```graphql
# Update scene rating and organized status
mutation {
  sceneUpdate(input: { id: "scene-123", rating100: 85, organized: true }) {
    id
    rating100
    organized
  }
}

# Mark performer as favorite
mutation {
  performerUpdate(input: { id: "456", favorite: true }) {
    id
    favorite
  }
}
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
