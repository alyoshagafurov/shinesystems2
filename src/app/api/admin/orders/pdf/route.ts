import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  items: OrderItem[];
  createdAt: string;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order: OrderData = await req.json();
  const orderTotal = order.items.reduce((s, item) => s + item.price * item.quantity, 0);
  const date = new Date(order.createdAt).toLocaleDateString("ru-RU");

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AUTOSHINE.TJ", 14, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${order.phone} · ${date}`, 14, 28);
  doc.text(`${order.firstName} ${order.lastName}`, 14, 34);
  if (order.address) {
    doc.text(order.address, 14, 40);
  }

  const startY = order.address ? 48 : 42;

  const tableBody = order.items.map((item, i) => [
    String(i + 1),
    item.name,
    `${item.quantity}`,
    `${item.price.toLocaleString("ru-RU")}`,
    `${(item.price * item.quantity).toLocaleString("ru-RU")}`,
  ]);

  tableBody.push(["", "", "", "ITOGO:", `${orderTotal.toLocaleString("ru-RU")}`]);

  (doc as any).autoTable({
    startY,
    head: [["#", "Naimenovanie", "Kol-vo", "Tsena", "Summa"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    didParseCell: (data: any) => {
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 12;
      }
    },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const fileName = `orders/order_${Date.now()}.pdf`;

  const supabase = getSupabaseAdmin();

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(fileName, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
