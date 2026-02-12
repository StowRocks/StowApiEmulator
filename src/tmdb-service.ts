import axios from 'axios';
import { kv } from '@vercel/kv';
import { getConfig } from './config';
import type { TMDBCastMember, TMDBImage, TMDBShowDetails, TMDBVideo } from './types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TTL = 86400; // 24 hours

export async function cachedFetch<T>(url: string): Promise<T> {
  try {
    const cached = await kv.get<T>(url);
    if (cached) return cached;
  } catch {
    // Redis unavailable, continue without cache
  }

  const { tmdbApiToken } = getConfig();
  const response = await axios.get<T>(url, {
    headers: { Authorization: `Bearer ${tmdbApiToken}` },
  });

  try {
    await kv.set(url, response.data, { ex: TTL });
  } catch {
    // Redis unavailable, continue without caching
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
