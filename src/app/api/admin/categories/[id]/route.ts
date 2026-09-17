import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if ("parentId" in body) data.parentId = body.parentId || null;
  if (body.order !== undefined) data.order = body.order;
  const category = await prisma.category.update({ where: { id }, data });
  return Response.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) {
    return Response.json({ error: `В этой категории ${products} товар(ов). Сначала переместите товары в другую категорию.` }, { status: 400 });
  }

  const children = await prisma.category.count({ where: { parentId: id } });
  if (children > 0) {
    return Response.json({ error: `В этой категории ${children} подкатегорий. Сначала переместите или удалите их.` }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return Response.json({ ok: true });
}
