import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDB() {
  await client.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    },
  ]);
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await client.execute({
    sql: "SELECT value FROM settings WHERE key = ?",
    args: [key],
  });
  return (result.rows[0]?.value as string) ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await client.execute({
    sql: `INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [key, value],
  });
}

export async function getDataForSEOCredentials(): Promise<{ login: string; password: string } | null> {
  const [login, password] = await Promise.all([
    getSetting("dataforseo_login"),
    getSetting("dataforseo_password"),
  ]);
  if (!login || !password) return null;
  return { login, password };
}

// Cache TTL: 7 days (SEO data doesn't change daily)
const CACHE_TTL_DAYS = 7;

export async function getCached<T>(key: string): Promise<T | null> {
  const result = await client.execute({
    sql: `SELECT data, created_at FROM cache WHERE key = ?
          AND created_at > datetime('now', ?)`,
    args: [key, `-${CACHE_TTL_DAYS} days`],
  });
  if (!result.rows[0]) return null;
  return JSON.parse(result.rows[0].data as string) as T;
}

export async function setCached(key: string, data: unknown): Promise<void> {
  await client.execute({
    sql: `INSERT INTO cache (key, data, created_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET data = excluded.data, created_at = excluded.created_at`,
    args: [key, JSON.stringify(data)],
  });
}

export function makeCacheKey(type: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params).sort().map(k => `${k}=${JSON.stringify(params[k])}`).join('&');
  return `${type}:${sorted}`;
}
