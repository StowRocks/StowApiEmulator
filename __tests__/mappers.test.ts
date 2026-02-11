import fc from 'fast-check';
import { mapVideoToScene, mapCastToPerformer, mapImagesToGallery, mapShowToMovie } from '@/mappers';
import type { TMDBVideo, TMDBCastMember, TMDBImage, TMDBShowDetails } from '@/types';

// --- Arbitraries ---

const arbAlphaNum = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });

const arbTMDBVideo: fc.Arbitrary<TMDBVideo> = fc.record({
  id: arbAlphaNum,
  key: arbAlphaNum,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom('Trailer', 'Clip', 'Featurette'),
  site: fc.constant('YouTube'),
});

const arbTMDBCastMember: fc.Arbitrary<TMDBCastMember> = fc.record({
  id: fc.integer({ min: 1, max: 999999 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  profile_path: fc.oneof(
    fc.constant(null),
    fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 50 }).map((s) => `/${s}.jpg`)
  ),
  character: fc.string({ minLength: 0, maxLength: 100 }),
});

const arbTMDBImage: fc.Arbitrary<TMDBImage> = fc.record({
  file_path: fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 50 }).map((s) => `/${s}.jpg`),
  width: fc.integer({ min: 1, max: 4000 }),
  height: fc.integer({ min: 1, max: 4000 }),
});

const arbTMDBShowDetails: fc.Arbitrary<TMDBShowDetails> = fc.record({
  id: fc.integer({ min: 1, max: 999999 }),
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  title: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  overview: fc.string({ minLength: 0, maxLength: 500 }),
  first_air_date: fc.option(fc.constant('2024-01-15'), { nil: undefined }),
  release_date: fc.option(fc.constant('2024-06-01'), { nil: undefined }),
});

describe('Feature: stow-api-simulator, Property 7: Video to Scene Mapping', () => {
  /**
   * Validates: Requirements 3.1
   *
   * For any valid TMDB video with a non-empty key, the mapped Scene should have:
   * - urls containing exactly ['https://www.youtube.com/watch?v=' + key]
   * - paths.screenshot equal to 'https://img.youtube.com/vi/' + key + '/0.jpg'
   * - title equal to the video's name
   */
  it('should correctly map video key to YouTube URL, thumbnail, and title', () => {
    fc.assert(
      fc.property(arbTMDBVideo, fc.integer({ min: 1, max: 999999 }), (video, showId) => {
        const scene = mapVideoToScene(video, showId);

        expect(scene.urls).toEqual([`https://www.youtube.com/watch?v=${video.key}`]);
        expect(scene.paths.screenshot).toBe(`https://img.youtube.com/vi/${video.key}/0.jpg`);
        expect(scene.title).toBe(video.name);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 8: Cast to Performer Mapping', () => {
  /**
   * Validates: Requirements 3.2
   *
   * For any valid TMDB cast member with a non-null profile_path, the mapped
   * Performer should have name equal to cast name and image_path constructed
   * from the TMDB original size base URL.
   */
  it('should correctly map cast name and construct image_path from profile_path', () => {
    const arbWithProfile = arbTMDBCastMember.filter((c) => c.profile_path !== null);

    fc.assert(
      fc.property(arbWithProfile, (cast) => {
        const performer = mapCastToPerformer(cast);

        expect(performer.name).toBe(cast.name);
        expect(performer.image_path).toBe(
          `https://image.tmdb.org/t/p/original${cast.profile_path}`
        );
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 9: Images to Gallery Mapping', () => {
  /**
   * Validates: Requirements 3.3
   *
   * For any non-empty array of TMDB images, the mapped Gallery should contain
   * exactly as many files entries as images, with each path being the full TMDB URL.
   */
  it('should map each image to a file with the correct TMDB URL', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999999 }),
        fc.array(arbTMDBImage, { minLength: 1, maxLength: 20 }),
        (personId, images) => {
          const gallery = mapImagesToGallery(personId, images);

          expect(gallery.files.length).toBe(images.length);
          images.forEach((img, i) => {
            expect(gallery.files[i].path).toBe(
              `https://image.tmdb.org/t/p/original${img.file_path}`
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 10: Show to Movie Mapping', () => {
  /**
   * Validates: Requirements 3.4
   *
   * For any valid TMDB show/movie details, the mapped Movie should have
   * name from the show's name (or title) and synopsis from overview.
   */
  it('should map show name/title to name and overview to synopsis', () => {
    fc.assert(
      fc.property(arbTMDBShowDetails, (show) => {
        const movie = mapShowToMovie(show);

        expect(movie.name).toBe(show.name ?? show.title ?? null);
        expect(movie.synopsis).toBe(show.overview);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 11: ID Uniqueness and Determinism', () => {
  /**
   * Validates: Requirements 3.5
   *
   * For any two distinct TMDB source IDs of the same type, the generated Stash
   * IDs should be different. For the same source ID, the ID should always be the same.
   */
  it('should produce deterministic and unique IDs for distinct inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999999 }),
        fc.integer({ min: 1, max: 999999 }),
        (idA, idB) => {
          // Determinism: same input → same output
          const movieA1 = mapShowToMovie({ id: idA, overview: 'a' });
          const movieA2 = mapShowToMovie({ id: idA, overview: 'b' });
          expect(movieA1.id).toBe(movieA2.id);

          const perfA1 = mapCastToPerformer({
            id: idA,
            name: 'x',
            profile_path: null,
            character: '',
          });
          const perfA2 = mapCastToPerformer({
            id: idA,
            name: 'y',
            profile_path: null,
            character: '',
          });
          expect(perfA1.id).toBe(perfA2.id);

          // Uniqueness: distinct IDs → distinct output (when IDs differ)
          if (idA !== idB) {
            const movieB = mapShowToMovie({ id: idB, overview: '' });
            expect(movieA1.id).not.toBe(movieB.id);

            const perfB = mapCastToPerformer({
              id: idB,
              name: '',
              profile_path: null,
              character: '',
            });
            expect(perfA1.id).not.toBe(perfB.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
