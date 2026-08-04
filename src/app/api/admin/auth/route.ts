import { login, logout } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { login: loginStr, password } = await request.json();
  const ok = await login(loginStr, password);
  if (!ok) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return Response.json({ ok: true });
}

export async function DELETE() {
  await logout();
  return Response.json({ ok: true });
}
