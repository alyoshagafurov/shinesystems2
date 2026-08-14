import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      parentId: body.parentId ?? undefined,
      order: body.order ?? undefined,
    },
  });
  return Response.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const hasProducts = await prisma.product.count({ where: { categoryId: id } });
  if (hasProducts > 0) {
    return Response.json({ error: "Нельзя удалить категорию с товарами" }, { status: 400 });
  }

  const hasChildren = await prisma.category.count({ where: { parentId: id } });
  if (hasChildren > 0) {
    return Response.json({ error: "Нельзя удалить категорию с подкатегориями" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return Response.json({ ok: true });
}
