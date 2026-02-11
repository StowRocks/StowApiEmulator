import fc from 'fast-check';
import { getConfig } from '@/config';

const REQUIRED_VARS = ['TMDB_API_KEY', 'TMDB_API_TOKEN', 'ALLOWED_TMDB_IDS'] as const;

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const original: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    original[key] = process.env[key];
    if (vars[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = vars[key];
    }
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

describe('Feature: stow-api-simulator, Property 1: TMDB ID Parsing Round Trip', () => {
  /**
   * Validates: Requirements 1.1
   *
   * For any array of positive integers, converting them to a comma-separated
   * string and parsing back through getConfig() should produce the same array.
   */
  it('should round-trip any array of positive integers through comma-separated parsing', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 999999 }), { minLength: 1, maxLength: 20 }),
        (ids) => {
          const csvString = ids.join(',');
          const config = (() => {
            let result: ReturnType<typeof getConfig> | undefined;
            withEnv(
              {
                TMDB_API_KEY: 'test-key',
                TMDB_API_TOKEN: 'test-token',
                ALLOWED_TMDB_IDS: csvString,
              },
              () => {
                result = getConfig();
              }
            );
            return result!;
          })();

          expect(config.allowedTmdbIds).toEqual(ids);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: stow-api-simulator, Property 2: Missing Environment Variable Error', () => {
  /**
   * Validates: Requirements 1.4
   *
   * For any non-empty subset of required env vars that is missing,
   * getConfig() should throw an error naming at least one missing variable.
   */
  it('should throw an error naming a missing variable for any subset of missing required vars', () => {
    fc.assert(
      fc.property(
        fc.subarray(REQUIRED_VARS as unknown as string[], { minLength: 1 }),
        (missingVars) => {
          const env: Record<string, string | undefined> = {
            TMDB_API_KEY: 'test-key',
            TMDB_API_TOKEN: 'test-token',
            ALLOWED_TMDB_IDS: '1,2,3',
          };
          for (const v of missingVars) {
            env[v] = undefined;
          }

          withEnv(env, () => {
            expect(() => getConfig()).toThrow();
            try {
              getConfig();
            } catch (e: unknown) {
              const message = (e as Error).message;
              const mentionsAtLeastOne = missingVars.some((v) => message.includes(v));
              expect(mentionsAtLeastOne).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
