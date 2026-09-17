import { gzipSync } from "zlib";

// Next.js does not compress route handler responses, and some payloads are large.
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
