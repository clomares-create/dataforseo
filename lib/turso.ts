import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDB() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
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
