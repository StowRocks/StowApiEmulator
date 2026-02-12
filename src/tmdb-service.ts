import axios from 'axios';
import Redis from 'ioredis';
import { getConfig } from './config';
import type { TMDBCastMember, TMDBImage, TMDBShowDetails, TMDBVideo } from './types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TTL = 86400; // 24 hours

let redis: Redis | null = null;
if (process.env.KV_URL) {
  redis = new Redis(process.env.KV_URL, { lazyConnect: true });
}

export async function cachedFetch<T>(url: string): Promise<T> {
  if (redis) {
    try {
      const cached = await redis.get(url);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis unavailable, continue without cache
    }
  }

  const { tmdbApiToken } = getConfig();
  const response = await axios.get<T>(url, {
    headers: { Authorization: `Bearer ${tmdbApiToken}` },
  });

  if (redis) {
    try {
      await redis.setex(url, TTL, JSON.stringify(response.data));
    } catch {
      // Redis unavailable, continue without caching
    }
  }

  return response.data;
}

export async function fetchShowDetails(showId: number): Promise<TMDBShowDetails> {
  return cachedFetch<TMDBShowDetails>(`${TMDB_BASE}/tv/${showId}`);
}

export async function fetchVideos(showId: number): Promise<TMDBVideo[]> {
  const data = await cachedFetch<{ results: TMDBVideo[] }>(`${TMDB_BASE}/tv/${showId}/videos`);
  return data.results;
}

export async function fetchCredits(showId: number): Promise<TMDBCastMember[]> {
  const data = await cachedFetch<{ cast: TMDBCastMember[] }>(`${TMDB_BASE}/tv/${showId}/credits`);
  return data.cast;
}

export async function fetchImages(personId: number): Promise<TMDBImage[]> {
  const data = await cachedFetch<{ profiles: TMDBImage[] }>(
    `${TMDB_BASE}/person/${personId}/images`
  );
  return data.profiles;
}

export async function fetchSeasonImages(showId: number, season: number): Promise<TMDBImage[]> {
  const data = await cachedFetch<{ posters: TMDBImage[] }>(
    `${TMDB_BASE}/tv/${showId}/season/${season}/images`
  );
  return data.posters || [];
}

export async function fetchAllShows(ids: number[]): Promise<TMDBShowDetails[]> {
  const { allowedTmdbIds } = getConfig();
  const filteredIds = ids.filter((id) => allowedTmdbIds.includes(id));

  const results = await Promise.all(
    filteredIds.map(async (id) => {
      try {
        return await fetchShowDetails(id);
      } catch (error) {
        console.error(`Failed to fetch show ${id}:`, error);
        return null;
      }
    })
  );

  return results.filter((r): r is TMDBShowDetails => r !== null);
}
