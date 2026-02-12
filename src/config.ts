export interface AppConfig {
  tmdbApiKey: string;
  tmdbApiToken: string;
  allowedTmdbIds: number[];
  enableInvidiousStreams: boolean;
}

const REQUIRED_VARS = ['TMDB_API_KEY', 'TMDB_API_TOKEN', 'ALLOWED_TMDB_IDS'] as const;

export function getConfig(): AppConfig {
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  const allowedTmdbIds = process.env.ALLOWED_TMDB_IDS!.split(',').map((s) => {
    const n = Number(s.trim());
    if (isNaN(n)) {
      throw new Error(`Invalid ALLOWED_TMDB_IDS: "${s.trim()}" is not a number`);
    }
    return n;
  });

  return {
    tmdbApiKey: process.env.TMDB_API_KEY!,
    tmdbApiToken: process.env.TMDB_API_TOKEN!,
    allowedTmdbIds,
    enableInvidiousStreams: process.env.ENABLE_INVIDIOUS_STREAMS === 'true',
  };
}
