import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { jsonResponse } from "@/lib/json-response";

export async function GET(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { select: { images: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse(request, orders);
}
