import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { html, orderId } = await req.json();
  if (!html) {
    return NextResponse.json({ error: "No html" }, { status: 400 });
  }

  const buffer = Buffer.from(html, "utf-8");
  const fileName = `orders/order_${orderId || Date.now()}.html`;

  const supabase = getSupabaseAdmin();

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(fileName, buffer, {
      contentType: "text/html; charset=utf-8",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
