import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, phone, address, comment, total, items } = body;

  if (!firstName || !phone || !items?.length) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      firstName,
      lastName: lastName || "",
      phone,
      address: address || "",
      comment: comment || "",
      total,
      items: {
        create: items.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  return Response.json(order);
}
