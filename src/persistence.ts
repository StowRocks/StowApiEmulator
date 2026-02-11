import { neon } from '@neondatabase/serverless';

interface SceneData {
  rating100?: number | null;
  organized?: boolean;
}

interface PerformerData {
  favorite?: boolean;
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS performer_data (
        id TEXT PRIMARY KEY,
        favorite BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      const result = await sql`SELECT rating100, organized FROM scene_data WHERE id = ${id}`;
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
        INSERT INTO scene_data (id, rating100, organized)
        VALUES (${id}, ${data.rating100 ?? null}, ${data.organized ?? false})
        ON CONFLICT (id) DO UPDATE SET
          rating100 = COALESCE(EXCLUDED.rating100, scene_data.rating100),
          organized = COALESCE(EXCLUDED.organized, scene_data.organized),
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
      const result = await sql`SELECT favorite FROM performer_data WHERE id = ${id}`;
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
        INSERT INTO performer_data (id, favorite)
        VALUES (${id}, ${data.favorite ?? false})
        ON CONFLICT (id) DO UPDATE SET
          favorite = EXCLUDED.favorite,
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
