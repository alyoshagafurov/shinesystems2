import { createHash } from "crypto";
import { prisma } from "./prisma";

export async function getCatalog() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, parentId: true },
    }),
    prisma.product.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, price: true, images: true, inStock: true, categoryId: true },
    }),
  ]);
  const version = createHash("sha1").update(JSON.stringify([categories, products])).digest("hex").slice(0, 16);
  return { categories, products, version };
}

export async function getSearchIndex() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      description: true,
      composition: true,
      dilution: true,
      application: true,
      precautions: true,
      storage: true,
      shelfLife: true,
    },
  });
  const index: Record<string, string> = {};
  for (const { id, ...fields } of products) {
    const text = Object.values(fields).join(" ").replace(/\s+/g, " ").trim().toLowerCase();
    if (text) index[id] = text;
  }
  return index;
}
