import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { order: "asc" } });
  return Response.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      composition: p.composition,
      dilution: p.dilution,
      application: p.application,
      precautions: p.precautions,
      storage: p.storage,
      shelfLife: p.shelfLife,
      price: p.price,
      images: p.images,
      inStock: p.inStock,
      categoryId: p.categoryId,
      order: p.order,
    })),
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
