import { NextRequest, NextResponse } from "next/server";
import { initDB, getSetting, setSetting } from "@/lib/turso";

export async function GET() {
  try {
    await initDB();
    const login = await getSetting("dataforseo_login");
    return NextResponse.json({ login: login ?? "", hasPassword: !!(await getSetting("dataforseo_password")) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const { login, password } = await req.json();
    if (!login || !password) {
      return NextResponse.json({ error: "Login and password required" }, { status: 400 });
    }
    await setSetting("dataforseo_login", login);
    await setSetting("dataforseo_password", password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
