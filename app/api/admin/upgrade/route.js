import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/upgrade
 * Ambil semua upgrade orders (dengan filter status opsional)
 */
export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("plan_orders")
      .select("*, users(id, name, email, role)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/upgrade
 * Body: { orderId, action: "approve" | "reject" }
 *
 * Approve: update role user + tandai order approved
 * Reject:  tandai order rejected saja
 */
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

    // Ambil order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("plan_orders")
      .select("*, users(id, role)")
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

    const now = new Date().toISOString();

    if (action === "reject") {
      await supabaseAdmin
        .from("plan_orders")
        .update({
          status:       "rejected",
          processed_by: auth.user.id,
          processed_at: now,
        })
        .eq("id", orderId);

      return NextResponse.json({ message: "Upgrade order ditolak." });
    }

    // APPROVE: update role user
    await supabaseAdmin
      .from("users")
      .update({ role: order.plan })
      .eq("id", order.user_id);

    // Update status order
    await supabaseAdmin
      .from("plan_orders")
      .update({
        status:       "approved",
        processed_by: auth.user.id,
        processed_at: now,
      })
      .eq("id", orderId);

    return NextResponse.json({
      message: `User berhasil diupgrade ke ${order.plan}.`,
    });
  } catch (e) {
    console.error("PATCH /api/admin/upgrade error:", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
