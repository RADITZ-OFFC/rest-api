import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { createQris } from "@/lib/payment";

/**
 * POST /api/payment/qris
 * Body: { orderId }
 * Generate QRIS payment untuk order tertentu
 */
export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib diisi." }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, total_price, status")
      .eq("id", orderId)
      .eq("user_id", auth.user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order sudah diproses atau tidak valid." }, { status: 400 });
    }

    const existingPayment = await supabaseAdmin
      .from("payments")
      .select("id, status")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .single();

    if (existingPayment.data) {
      return NextResponse.json({
        message: "Sudah ada pembayaran aktif untuk order ini.",
        payment: existingPayment.data,
      }, { status: 200 });
    }

    const result = await createQris(order.total_price);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Gagal membuat QRIS." }, { status: 500 });
    }

    const expiredDate = new Date(result.data.expired * 1000);

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: orderId,
        user_id: auth.user.id,
        qris_id: result.data.id,
        qrcode_url: result.data.qrcode_url,
        amount: result.data.amount,
        status: "pending",
        expired_at: expiredDate.toISOString(),
        raw_response: result.data,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Create payment error:", paymentError);
      return NextResponse.json({ error: "Gagal menyimpan data pembayaran." }, { status: 500 });
    }

    return NextResponse.json({
      message: "QRIS berhasil dibuat.",
      payment,
      qris: result.data,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payment/qris error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
