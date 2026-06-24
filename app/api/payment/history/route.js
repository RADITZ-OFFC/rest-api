import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getHistory, getAllHistory } from "@/lib/payment";

/**
 * GET /api/payment/history?page=1&all=false
 * Ambil riwayat pembayaran QRIS
 * all=true → ambil semua history dari OrderKuota
 */
export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const fetchAll = searchParams.get("all") === "true";

    let result;
    if (fetchAll) {
      result = await getAllHistory();
    } else {
      result = await getHistory(page);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Gagal mengambil history." }, { status: 500 });
    }

    const { data: localPayments } = await supabaseAdmin
      .from("payments")
      .select("id, order_id, qris_id, amount, status, expired_at, paid_at, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      message: "History berhasil diambil.",
      remote: result.data,
      local: localPayments || [],
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/payment/history error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
