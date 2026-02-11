import fc from 'fast-check';
import axios from 'axios';
import { clearCache } from '@/tmdb-service';
import { resolvers } from '@/resolvers';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function setEnv(ids: number[]) {
  process.env.TMDB_API_KEY = 'test-key';
  process.env.TMDB_API_TOKEN = 'test-token';
  process.env.ALLOWED_TMDB_IDS = ids.join(',');
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

function mockTmdbResponses(ids: number[], videosPerShow: number, castPerShow: number) {
  mockedAxios.get.mockImplementation(async (url: string) => {
    for (const id of ids) {
      if (url.endsWith(`/tv/${id}/videos`)) {
        return {
          data: {
            results: Array.from({ length: videosPerShow }, (_, i) => ({
              id: `v${id}-${i}`,
              key: `key${id}${i}`,
              name: `Video ${i}`,
              type: 'Trailer',
              site: 'YouTube',
            })),
          },
        };
      }
      if (url.endsWith(`/tv/${id}/credits`)) {
        return {
          data: {
            cast: Array.from({ length: castPerShow }, (_, i) => ({
              id: id * 1000 + i,
              name: `Actor ${id}-${i}`,
              profile_path: `/p${id}${i}.jpg`,
              character: `Char ${i}`,
            })),
          },
        };
      }
      if (url.endsWith(`/tv/${id}`)) {
        return {
          data: { id, name: `Show ${id}`, overview: `Overview ${id}` },
        };
      }
    }
    return { data: {} };
  });
}

describe('Feature: stow-api-simulator, Property 12: Result Count Consistency', () => {
  /**
   * Validates: Requirements 5.3
   *
   * For any query result, the count field should equal the length of the
   * scenes or performers array respectively.
   */
  it('findScenes count should equal scenes array length', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.integer({ min: 1, max: 500 }), { minLength: 1, maxLength: 3 }),
        fc.integer({ min: 0, max: 5 }),
        async (ids, videosPerShow) => {
          resetState();
          setEnv(ids);
          mockTmdbResponses(ids, videosPerShow, 2);

          const result = await resolvers.Query.findScenes();
          expect(result.count).toBe(result.scenes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('findPerformers count should equal performers array length', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.integer({ min: 1, max: 500 }), { minLength: 1, maxLength: 3 }),
        fc.integer({ min: 0, max: 5 }),
        async (ids, castPerShow) => {
          resetState();
          setEnv(ids);
          mockTmdbResponses(ids, 1, castPerShow);

          const result = await resolvers.Query.findPerformers();
          expect(result.count).toBe(result.performers.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('findScenes resolver', () => {
  it('should return scenes with performers and movies for allowed IDs', async () => {
    setEnv([42]);
    mockTmdbResponses([42], 2, 1);

    const result = await resolvers.Query.findScenes();

    expect(result.scenes).toHaveLength(2);
    expect(result.scenes[0].title).toBe('Video 0');
    expect(result.scenes[0].urls).toEqual(['https://www.youtube.com/watch?v=key420']);
    expect(result.scenes[0].performers).toHaveLength(1);
    expect(result.scenes[0].performers[0].name).toBe('Actor 42-0');
    expect(result.scenes[0].movies).toHaveLength(1);
    expect(result.scenes[0].movies[0].name).toBe('Show 42');
  });
});

describe('findPerformers resolver', () => {
  it('should deduplicate performers across multiple shows', async () => {
    setEnv([1, 2]);
    // Both shows share actor ID 1000 (id = showId * 1000 + index, so show 1 cast[0] = 1000)
    mockedAxios.get.mockImplementation(async (url: string) => {
      if (url.includes('/credits')) {
        return {
          data: {
            cast: [
              { id: 1000, name: 'Shared Actor', profile_path: '/shared.jpg', character: 'Role' },
              {
                id: url.includes('/1/') ? 2000 : 3000,
                name: 'Unique',
                profile_path: null,
                character: 'X',
              },
            ],
          },
        };
      }
      return { data: {} };
    });

    const result = await resolvers.Query.findPerformers();

    // 1000 appears in both shows but should only appear once
    const ids = result.performers.map((p: { id: string }) => p.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    expect(ids).toContain('1000');
  });
});

describe('Performer.galleries nested resolver', () => {
  it('should fetch and map profile images for a performer', async () => {
    setEnv([1]);
    mockedAxios.get.mockResolvedValue({
      data: {
        profiles: [
          { file_path: '/img1.jpg', width: 300, height: 450 },
          { file_path: '/img2.jpg', width: 300, height: 450 },
        ],
      },
    });

    const galleries = await resolvers.Performer.galleries({
      id: '123',
      name: 'Test',
      image_path: null,
      galleries: [],
    });

    expect(galleries).toHaveLength(1);
    expect(galleries[0].id).toBe('gallery-123');
    expect(galleries[0].files).toHaveLength(2);
    expect(galleries[0].files[0].path).toBe('https://image.tmdb.org/t/p/original/img1.jpg');
  });
});

describe('Movie.scenes nested resolver', () => {
  it('should fetch and map videos for a movie', async () => {
    setEnv([1]);
    mockedAxios.get.mockResolvedValue({
      data: {
        results: [{ id: 'v1', key: 'abc123', name: 'Trailer', type: 'Trailer', site: 'YouTube' }],
      },
    });

    const scenes = await resolvers.Movie.scenes({
      id: '99',
      name: 'Test Movie',
      synopsis: 'A movie',
      scenes: [],
    });

    expect(scenes).toHaveLength(1);
    expect(scenes[0].urls).toEqual(['https://www.youtube.com/watch?v=abc123']);
    expect(scenes[0].paths.screenshot).toBe('https://img.youtube.com/vi/abc123/0.jpg');
  });
});
