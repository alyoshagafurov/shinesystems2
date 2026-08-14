import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return Response.json(
    categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId, order: c.order }))
  );
}
