import { NextResponse } from "next/server";
import { initDB } from "@/lib/turso";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function DELETE() {
  try {
    await initDB();
    await client.execute("DELETE FROM cache");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initDB();
    const result = await client.execute(
      "SELECT key, created_at FROM cache ORDER BY created_at DESC"
    );
    return NextResponse.json({ count: result.rows.length, entries: result.rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
