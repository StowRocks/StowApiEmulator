import axios from 'axios';
import { getConfig } from './config';
import type { TMDBCastMember, TMDBImage, TMDBShowDetails, TMDBVideo } from './types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TTL_MS = 86_400_000; // 24 hours

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export async function cachedFetch<T>(url: string): Promise<T> {
  const existing = cache.get(url);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.data as T;
  }

  const { tmdbApiToken } = getConfig();
  const response = await axios.get<T>(url, {
    headers: { Authorization: `Bearer ${tmdbApiToken}` },
  });

  cache.set(url, { data: response.data, expiresAt: Date.now() + TTL_MS });
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

/** Clears the in-memory cache. Useful for testing. */
export function clearCache(): void {
  cache.clear();
}
