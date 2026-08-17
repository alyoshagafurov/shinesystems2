import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const body: { ids: string[] } = await req.json();
  if (!body.ids?.length) return Response.json({ error: "ids required" }, { status: 400 });

  await prisma.$transaction(
    body.ids.map((id, i) => prisma.product.update({ where: { id }, data: { order: i } }))
  );
  return Response.json({ ok: true });
}
