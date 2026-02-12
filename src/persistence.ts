import { neon } from '@neondatabase/serverless';

interface SceneData {
  rating100?: number | null;
  organized?: boolean;
  o_counter?: number;
}

interface PerformerData {
  favorite?: boolean;
  rating100?: number | null;
}

// In-memory cache fallback
const memoryCache = new Map<string, any>();

const hasPostgres = !!process.env.DATABASE_URL;
const sql = hasPostgres ? neon(process.env.DATABASE_URL!) : null;

let dbInitialized = false;

async function initDb() {
  if (!sql || dbInitialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS scene_data (
        id TEXT PRIMARY KEY,
        rating100 INTEGER,
        organized BOOLEAN DEFAULT FALSE,
        o_counter INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS performer_data (
        id TEXT PRIMARY KEY,
        favorite BOOLEAN DEFAULT FALSE,
        rating100 INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tmdb_cache (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `;

    dbInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export async function getSceneData(id: string): Promise<SceneData> {
  if (sql) {
    await initDb();
    try {
      const result =
        await sql`SELECT rating100, organized, o_counter FROM scene_data WHERE id = ${id}`;
      return result[0] || {};
    } catch {
      return {};
    }
  }
  return memoryCache.get(`scene:${id}`) || {};
}

export async function updateSceneData(id: string, data: SceneData): Promise<void> {
  if (sql) {
    await initDb();
    try {
      await sql`
        INSERT INTO scene_data (id, rating100, organized, o_counter)
        VALUES (${id}, ${data.rating100 ?? null}, ${data.organized ?? false}, ${data.o_counter ?? 0})
        ON CONFLICT (id) DO UPDATE SET
          rating100 = COALESCE(EXCLUDED.rating100, scene_data.rating100),
          organized = COALESCE(EXCLUDED.organized, scene_data.organized),
          o_counter = COALESCE(EXCLUDED.o_counter, scene_data.o_counter),
          updated_at = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      console.error('Failed to update scene data:', error);
    }
  } else {
    const existing = memoryCache.get(`scene:${id}`) || {};
    memoryCache.set(`scene:${id}`, { ...existing, ...data });
  }
}

export async function getPerformerData(id: string): Promise<PerformerData> {
  if (sql) {
    await initDb();
    try {
      const result = await sql`SELECT favorite, rating100 FROM performer_data WHERE id = ${id}`;
      return result[0] || {};
    } catch {
      return {};
    }
  }
  return memoryCache.get(`performer:${id}`) || {};
}

export async function updatePerformerData(id: string, data: PerformerData): Promise<void> {
  if (sql) {
    await initDb();
    try {
      await sql`
        INSERT INTO performer_data (id, favorite, rating100)
        VALUES (${id}, ${data.favorite ?? false}, ${data.rating100 ?? null})
        ON CONFLICT (id) DO UPDATE SET
          favorite = COALESCE(EXCLUDED.favorite, performer_data.favorite),
          rating100 = COALESCE(EXCLUDED.rating100, performer_data.rating100),
          updated_at = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      console.error('Failed to update performer data:', error);
    }
  } else {
    const existing = memoryCache.get(`performer:${id}`) || {};
    memoryCache.set(`performer:${id}`, { ...existing, ...data });
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  if (sql) {
    await initDb();
    try {
      const result = await sql`
        SELECT data FROM tmdb_cache 
        WHERE key = ${key} AND expires_at > NOW()
      `;
      return result[0]?.data || null;
    } catch {
      return null;
    }
  }
  const cached = memoryCache.get(`cache:${key}`);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  return null;
}

export async function setCachedData(key: string, data: any, ttlHours = 24): Promise<void> {
  if (sql) {
    await initDb();
    try {
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
      await sql`
        INSERT INTO tmdb_cache (key, data, expires_at)
        VALUES (${key}, ${JSON.stringify(data)}, ${expiresAt.toISOString()})
        ON CONFLICT (key) DO UPDATE SET
          data = EXCLUDED.data,
          expires_at = EXCLUDED.expires_at
      `;
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  } else {
    memoryCache.set(`cache:${key}`, {
      data,
      expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    });
  }
}
