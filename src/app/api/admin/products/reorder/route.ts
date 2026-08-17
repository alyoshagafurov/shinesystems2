import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  try {
    const body: { ids: string[] } = await req.json();
    if (!body.ids?.length) return Response.json({ error: "ids required" }, { status: 400 });

    for (let i = 0; i < body.ids.length; i++) {
      await prisma.product.update({ where: { id: body.ids[i] }, data: { order: i } });
    }
    revalidatePath("/");
    return Response.json({ ok: true, updated: body.ids.length });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
