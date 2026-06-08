import { NextResponse } from "next/server";
import { initDB, getDataForSEOCredentials } from "@/lib/turso";

export async function GET() {
  try {
    await initDB();
    const creds = await getDataForSEOCredentials();
    if (!creds) return NextResponse.json({ error: "No credentials" }, { status: 400 });

    const auth = "Basic " + Buffer.from(`${creds.login}:${creds.password}`).toString("base64");

    const res = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify([{ target: "maisoncatrosgerand.fr", location_code: 2250, language_code: "fr", date_from: "2024-06-01", date_to: "2025-05-31" }]),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
