import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] || ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return Response.json(categories);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  if (!body.name) return Response.json({ error: "Name required" }, { status: 400 });

  let slug = slugify(body.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const maxOrder = await prisma.category.aggregate({
    _max: { order: true },
    where: { parentId: body.parentId || null },
  });

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug,
      parentId: body.parentId || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  return Response.json(category);
}
