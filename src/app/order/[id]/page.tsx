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

  const zoomScript = `
    (function() {
      var wrap = document.getElementById('table-zoom');
      if (!wrap) return;
      var scale = 1, startDist = 0, startScale = 1, lastTap = 0;
      function getDist(e) {
        var t = e.touches;
        return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      }
      wrap.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
          e.preventDefault();
          startDist = getDist(e);
          startScale = scale;
        }
        if (e.touches.length === 1) {
          var now = Date.now();
          if (now - lastTap < 300) { scale = 1; wrap.style.transform = 'scale(1)'; wrap.style.transformOrigin = 'top left'; }
          lastTap = now;
        }
      }, { passive: false });
      wrap.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
          e.preventDefault();
          var d = getDist(e);
          scale = Math.min(3, Math.max(1, startScale * (d / startDist)));
          wrap.style.transform = 'scale(' + scale + ')';
          wrap.style.transformOrigin = 'top left';
        }
      }, { passive: false });
    })();
  `;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Заказ №{order.orderNumber} — AUTOSHINE.TJ</title>
      </head>
      <body style={{ margin: 0, padding: "16px 12px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#111", maxWidth: 600, marginLeft: "auto", marginRight: "auto", overflowX: "hidden" }}>
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #111" }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AUTOSHINE.TJ</h1>
          <p style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>Заказ №{order.orderNumber}</p>
          <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{order.phone} · {date}</p>
          <p style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{order.firstName} {order.lastName}</p>
          {order.address && <p style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{order.address}</p>}
        </div>

        <div id="table-zoom" style={{ touchAction: "pan-y", transition: "transform 0.15s ease" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 6px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#999", fontSize: 11 }}>№</th>
                <th style={{ textAlign: "left", padding: "10px 6px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#999", fontSize: 11 }}>Товар</th>
                <th style={{ textAlign: "center", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#999", fontSize: 11, whiteSpace: "nowrap" }}>Кол-во</th>
                <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #ddd", fontWeight: 600, color: "#999", fontSize: 11, whiteSpace: "nowrap" }}>Цена</th>
                <th style={{ textAlign: "right", padding: "10px 8px 10px 12px", borderBottom: "2px solid #ddd", borderLeft: "1px solid #e5e5e5", fontWeight: 600, color: "#999", fontSize: 11, whiteSpace: "nowrap" }}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ padding: "10px 6px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" }}>{i + 1}</td>
                  <td style={{ padding: "10px 6px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" style={{ width: 30, height: 30, borderRadius: 3, objectFit: "contain", background: "#f5f5f5", flexShrink: 0 }} />}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "10px 8px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", verticalAlign: "middle" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", padding: "10px 8px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", verticalAlign: "middle" }}>{item.price.toLocaleString("ru-RU")}</td>
                  <td style={{ textAlign: "right", padding: "10px 8px 10px 12px", borderBottom: "1px solid #f0f0f0", borderLeft: "1px solid #e5e5e5", whiteSpace: "nowrap", fontWeight: 600, verticalAlign: "middle" }}>{(item.price * item.quantity).toLocaleString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", padding: "12px 8px 10px", borderTop: "2px solid #111", fontWeight: 700, fontSize: 13 }}>ИТОГО:</td>
                <td style={{ textAlign: "right", padding: "12px 8px 10px 12px", borderTop: "2px solid #111", borderLeft: "1px solid #e5e5e5", fontWeight: 700, fontSize: 13 }}>{orderTotal.toLocaleString("ru-RU")}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <script dangerouslySetInnerHTML={{ __html: zoomScript }} />
      </body>
    </html>
  );
}
