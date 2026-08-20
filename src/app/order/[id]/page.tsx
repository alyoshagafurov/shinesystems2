import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { images: true } } } } },
  });

  if (!order) return notFound();

  const orderTotal = order.items.reduce((s, item) => s + item.price * item.quantity, 0);
  const date = order.createdAt.toLocaleDateString("ru-RU");

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Заказ №{order.orderNumber} — AUTOSHINE.TJ</title>
      </head>
      <body style={{ margin: 0, padding: 24, fontFamily: "system-ui, -apple-system, sans-serif", color: "#111", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #111" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AUTOSHINE.TJ</h1>
          <p style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>Заказ №{order.orderNumber}</p>
          <p style={{ fontSize: 13, color: "#444", marginTop: 6 }}>{order.phone} · {date}</p>
          <p style={{ fontSize: 13, color: "#444", marginTop: 6 }}>{order.firstName} {order.lastName}</p>
          {order.address && <p style={{ fontSize: 13, color: "#444", marginTop: 6 }}>{order.address}</p>}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#666" }}>№</th>
              <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#666" }}>Товар</th>
              <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#666" }}>Кол-во</th>
              <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#666" }}>Цена</th>
              <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#666" }}>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{i + 1}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: "contain", background: "#f5f5f5", flexShrink: 0 }} />}
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: "right", padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.quantity} шт</td>
                <td style={{ textAlign: "right", padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.price.toLocaleString("ru-RU")} с.</td>
                <td style={{ textAlign: "right", padding: "10px 8px", borderBottom: "1px solid #eee" }}>{(item.price * item.quantity).toLocaleString("ru-RU")} с.</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: "right", padding: "14px 8px 10px", borderTop: "2px solid #111", fontWeight: 700, fontSize: 15 }}>ИТОГО:</td>
              <td style={{ textAlign: "right", padding: "14px 8px 10px", borderTop: "2px solid #111", fontWeight: 700, fontSize: 15 }}>{orderTotal.toLocaleString("ru-RU")} с.</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  );
}
