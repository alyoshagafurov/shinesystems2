import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();

  if (body.items) {
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.orderItem.createMany({
      data: body.items.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
        orderId: id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  const total = body.items
    ? body.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)
    : body.total;

  const order = await prisma.order.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
      comment: body.comment,
      total,
      status: body.status,
    },
    include: { items: true },
  });

  return Response.json(order);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return Response.json({ ok: true });
}
