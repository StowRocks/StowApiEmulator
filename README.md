# Stow API Emulator

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Deployed](https://img.shields.io/badge/deployed-api.stow.rocks-blue.svg)](https://api.stow.rocks/graphql)

GraphQL API emulator for [Stow](https://stow.rocks), using TMDB as data source. This public API enables the Stow iOS app to run on Vercel's free tier for demo and development purposes.

**Live API:** https://api.stow.rocks/graphql

## Features

### Data Sources

- **100 TV Shows** - Top-rated series from TMDB
- **~162 Scenes** - Episode trailers and clips
- **~676 Performers** - Cast members with real photos
- **~33 Studios** - TV networks (NBC, Netflix, FOX, etc.)
- **~14 Tags** - Genres (Crime, Drama, Mystery, etc.)
- **~100 Galleries** - Season poster collections
- **~500 Images** - Individual poster images
- **~100 Groups** - TV shows as series

### API Features

- **GraphQL Schema** - ~95% compatible with Stash reference implementation
- **Real URLs** - YouTube videos, TMDB images, all publicly accessible
- **Mutations** - Update ratings, favorites, organized status, o_counter
- **Persistence** - Postgres (Neon) or in-memory cache
- **Real Counts** - Scene counts per performer/studio/tag
- **Timestamps** - Episode air dates for created_at/updated_at
- **StashIDs** - TMDB IDs mapped to StashID format
- **Caching** - 24-hour TTL for TMDB API responses

### Queries Supported

- `findScenes`, `findScene(id)` - Episodes with performers, tags, studio
- `findPerformers`, `findPerformer(id)` - Cast with scene counts
- `findStudios`, `findStudio(id)` - Networks with scene counts
- `findTags`, `findTag(id)` - Genres with scene counts
- `findGalleries` - Season poster collections
- `findImages` - Individual poster images
- `findGroups` - TV shows as series
- `systemStatus` - Database info

### Mutations Supported

- `sceneUpdate` - Update rating100, organized, o_counter
- `performerUpdate` - Update favorite, rating100

## Setup

```bash
npm install
cp .env.example .env
# Add your TMDB API key to .env
```

## Environment Variables

Required:

- `TMDB_API_KEY` - TMDB API key ([get one here](https://www.themoviedb.org/settings/api))
- `TMDB_API_TOKEN` - TMDB Bearer token
- `ALLOWED_TMDB_IDS` - Comma-separated TV show IDs (default: top 100 shows)

Optional:

- `DATABASE_URL` - Neon Postgres connection string (enables persistence)

## Development

```bash
npm run dev
```

GraphQL Playground: http://localhost:3000/api/graphql

## Testing

```bash
npm test
```

## Example Queries

### Find Scenes

```graphql
query {
  findScenes(filter: { per_page: 10, page: 1 }) {
    count
    scenes {
      id
      title
      date
      urls
      paths {
        screenshot
        stream
      }
      performers {
        id
        name
        image_path
      }
      studio {
        id
        name
      }
      tags {
        id
        name
      }
    }
  }
}
```

### Find Performer with Scene Count

```graphql
query {
  findPerformer(id: "12345") {
    id
    name
    image_path
    scene_count
    favorite
    rating100
  }
}
```

### Update Scene

```graphql
mutation {
  sceneUpdate(input: { id: "scene-2734-abc123", rating100: 85, organized: true, o_counter: 3 }) {
    id
    rating100
    organized
    o_counter
  }
}
```

## Performance

Benchmark results (from `benchmark-stash.js`):

**Quick Queries (10 items):**

- Scenes: ~150ms (cached), ~2.8s (cold start)
- Performers: ~200ms
- Studios: ~180ms
- Tags: ~220ms
- Galleries: ~230ms
- Groups: ~150ms
- Images: ~250ms

**Full Sync (all items, all fields):**

- Scenes: ~6s (265KB)
- Performers: ~5s (455KB)
- Studios: ~230ms (21KB)
- Tags: ~240ms (4KB)
- Galleries: ~440ms (21KB)
- Groups: ~240ms (59KB)

## Compatibility

**Schema Compatibility:** ~95% with Stash reference implementation

**Fully Compatible:**

- Core queries (findScenes, findPerformers, findStudios, findTags)
- Single-item queries (findScene, findPerformer, findStudio, findTag)
- Filter system (CriterionModifier, MultiCriterionInput)
- Basic mutations (sceneUpdate, performerUpdate)
- Type safety (non-null markers, enums)

**Partially Compatible:**

- Scene type (70% - missing interactive features, play history)
- Performer type (95% - missing scenes array)
- Studio type (95% - missing some count fields)
- Tag type (100%)

**Not Implemented:**

- Scene markers (TMDB doesn't have chapter data)
- Captions (not in TMDB API)
- Create/destroy mutations (read-only emulator)
- Bulk operations

See [COMPATIBILITY_DEEP_ANALYSIS.md](COMPATIBILITY_DEEP_ANALYSIS.md) for details.

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

## License

GPL-3.0 - See [LICENSE](LICENSE) for details.

## Related Projects

- [Stow iOS App](https://github.com/StowRocks/StashAppiOS) - iOS client for Stash servers
- [Stash](https://github.com/stashapp/stash) - Reference implementation
