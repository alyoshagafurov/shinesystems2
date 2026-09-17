import { getCatalog, jsonResponse } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const known = new URL(req.url).searchParams.get("v");
  const catalog = await getCatalog();
  if (known && known === catalog.version) return jsonResponse(req, { unchanged: true });
  return jsonResponse(req, catalog);
}
