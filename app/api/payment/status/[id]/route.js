import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getQrisStatus, checkStatus } from "@/lib/payment";

/**
 * GET /api/payment/status/[id]
 * Cek status pembayaran berdasarkan payment ID
 */
export async function GET(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
    }

    let currentStatus = payment.status;
    if (payment.status === "pending" && payment.expired_at) {
      const expiredTime = Math.floor(new Date(payment.expired_at).getTime() / 1000);
      currentStatus = getQrisStatus(expiredTime, payment.status);

      if (currentStatus === "expired" && payment.status !== "expired") {
        await supabaseAdmin
          .from("payments")
          .update({ status: "expired" })
          .eq("id", payment.id);
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        qris_id: payment.qris_id,
        qrcode_url: payment.qrcode_url,
        amount: payment.amount,
        status: currentStatus,
        status_label: checkStatus(currentStatus),
        expired_at: payment.expired_at,
        paid_at: payment.paid_at,
        created_at: payment.created_at,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/payment/status/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
