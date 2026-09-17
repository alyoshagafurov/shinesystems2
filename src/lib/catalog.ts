import { createHash } from "crypto";
import { gzipSync } from "zlib";
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

// Next.js does not compress route handler responses, and these payloads are large.
export function jsonResponse(req: Request, body: unknown) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Vary: "Accept-Encoding",
  };
  const json = JSON.stringify(body);
  if (json.length > 1024 && /\bgzip\b/.test(req.headers.get("accept-encoding") ?? "")) {
    headers["Content-Encoding"] = "gzip";
    return new Response(new Uint8Array(gzipSync(json)), { headers });
  }
  return new Response(json, { headers });
}
