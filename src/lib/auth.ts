import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const SESSION_KEY = "admin_session";

export async function login(loginStr: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { login: loginStr } });
  if (!admin) return false;
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return false;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return true;
}

export async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_KEY);
  if (!session?.value) return false;
  const admin = await prisma.admin.findUnique({ where: { id: session.value } });
  return !!admin;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}
