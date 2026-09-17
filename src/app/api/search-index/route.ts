import { getSearchIndex, jsonResponse } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return jsonResponse(req, await getSearchIndex());
}
