import { getSearchIndex } from "@/lib/catalog";
import { jsonResponse } from "@/lib/json-response";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return jsonResponse(req, await getSearchIndex());
}
