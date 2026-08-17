import { ClientApp } from "@/components/ClientApp";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { order: "asc" } }),
      prisma.product.findMany({ orderBy: { order: "asc" } }),
    ]);
    return {
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId })),
      products: products.map((p) => ({
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
      })),
    };
  } catch {
    return { categories: [], products: [] };
  }
}

export default async function Home() {
  const { categories, products } = await getData();
  return <ClientApp categories={categories} products={products} />;
}
