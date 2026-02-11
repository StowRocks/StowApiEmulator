import fc from 'fast-check';
import axios from 'axios';
import { clearCache, cachedFetch, fetchAllShows } from '@/tmdb-service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function setEnv(key: string, token: string, ids: string) {
  process.env.TMDB_API_KEY = key;
  process.env.TMDB_API_TOKEN = token;
  process.env.ALLOWED_TMDB_IDS = ids;
}

function resetState() {
  clearCache();
  mockedAxios.get.mockReset();
  delete process.env.TMDB_API_KEY;
  delete process.env.TMDB_API_TOKEN;
  delete process.env.ALLOWED_TMDB_IDS;
}

beforeEach(resetState);
afterEach(resetState);

describe('Feature: stow-api-simulator, Property 3: Allowed ID Filtering', () => {
  /**
   * Validates: Requirements 2.2
   *
   * For any set of requested IDs and any configured ALLOWED_TMDB_IDS list,
   * fetchAllShows should only make HTTP requests for IDs present in the allowed list.
   */
  it('should only fetch shows for IDs in the allowed list', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 10 }),
        fc.uniqueArray(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 10 }),
        async (requestedIds, allowedIds) => {
          resetState();
          setEnv('key', 'token', allowedIds.join(','));
          mockedAxios.get.mockResolvedValue({ data: { id: 1, overview: 'test' } });

          await fetchAllShows(requestedIds);

          const expectedIds = requestedIds.filter((id) => allowedIds.includes(id));
          expect(mockedAxios.get).toHaveBeenCalledTimes(expectedIds.length);

          for (const call of mockedAxios.get.mock.calls) {
            const url = call[0] as string;
            const idMatch = url.match(/\/tv\/(\d+)$/);
            if (idMatch) {
              expect(allowedIds).toContain(Number(idMatch[1]));
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 4: Authentication Header Presence', () => {
  /**
   * Validates: Requirements 2.4
   *
   * For any TMDB API request made by cachedFetch, the request should include
   * an Authorization header with the configured Bearer token.
   */
  it('should include Authorization Bearer header on every request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.integer({ min: 1, max: 99999 }),
        async (token, showId) => {
          resetState();
          setEnv('key', token, String(showId));
          mockedAxios.get.mockResolvedValue({ data: { id: showId, overview: '' } });

          const url = `https://api.themoviedb.org/3/tv/${showId}`;
          await cachedFetch(url);

          expect(mockedAxios.get).toHaveBeenCalledWith(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 5: Error Resilience', () => {
  /**
   * Validates: Requirements 2.5
   *
   * For any TMDB API error response, fetchAllShows should return an empty
   * or partial result list without throwing an exception.
   */
  it('should return empty results for IDs that fail, without throwing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 5 }),
        async (ids) => {
          resetState();
          setEnv('key', 'token', ids.join(','));
          mockedAxios.get.mockRejectedValue(new Error('Network Error'));

          const result = await fetchAllShows(ids);

          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 6: Cache Hit Avoids Network Request', () => {
  /**
   * Validates: Requirements 2.7
   *
   * After a successful fetch, a subsequent fetch for the same endpoint within
   * 24 hours should return the same data without making a new HTTP request.
   */
  it('should serve cached data on second call without a new network request', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 99999 }), async (showId) => {
        resetState();
        setEnv('key', 'token', String(showId));

        const fakeData = { id: showId, overview: 'cached' };
        mockedAxios.get.mockResolvedValue({ data: fakeData });

        const url = `https://api.themoviedb.org/3/tv/${showId}`;

        const first = await cachedFetch(url);
        const second = await cachedFetch(url);

        expect(second).toEqual(first);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });
});
