import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(products);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || "",
      composition: body.composition || "",
      dilution: body.dilution || "",
      application: body.application || "",
      precautions: body.precautions || "",
      storage: body.storage || "",
      shelfLife: body.shelfLife || "",
      price: body.price,
      images: body.images || [],
      inStock: body.inStock ?? true,
      categoryId: body.categoryId,
    },
  });
  return Response.json(product);
}
