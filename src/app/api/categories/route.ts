import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return Response.json(
    categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId, order: c.order })),
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
