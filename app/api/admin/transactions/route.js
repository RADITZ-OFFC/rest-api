import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { createApiKey } from "@/lib/apiKeyGen";

// GET /api/admin/transactions — semua order
export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        users ( id, name, email ),
        packages (
          name,
          quota,
          price,
          duration_days,
          products ( id, name, category )
        )
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil transaksi." }, { status: 500 });
    }

    return NextResponse.json({ transactions: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PATCH /api/admin/transactions — konfirmasi atau tolak order
export async function PATCH(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { orderId, action } = await request.json();

    if (!orderId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "orderId dan action (approve/reject) wajib diisi." },
        { status: 400 }
      );
    }

    // Ambil data order lengkap
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        packages ( quota, duration_days, products ( id ) )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Order sudah diproses sebelumnya." },
        { status: 400 }
      );
    }

    if (action === "reject") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      return NextResponse.json({ message: "Order berhasil ditolak." }, { status: 200 });
    }

    // Approve: update status order + generate API key
    await supabaseAdmin
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", orderId);

    const apiKey = await createApiKey({
      userId: order.user_id,
      productId: order.packages.products.id,
      orderId: order.id,
      quotaTotal: order.packages.quota,
      durationDays: order.packages.duration_days || null,
    });

    return NextResponse.json(
      {
        message: "Order dikonfirmasi. API key berhasil dibuat.",
        apiKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
