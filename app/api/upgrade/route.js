import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { PLANS, isPlanHigher } from "@/lib/plans";

/**
 * POST /api/upgrade
 * Body: { plan: "premium" | "super_premium", note?: string }
 *
 * Buat upgrade order. Admin akan konfirmasi manual.
 */
export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { plan, note } = await request.json();

    // Validasi plan
    if (!["premium", "super_premium"].includes(plan)) {
      return NextResponse.json(
        { error: "Plan tidak valid. Pilih 'premium' atau 'super_premium'." },
        { status: 400 }
      );
    }

    // Ambil data user saat ini
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", auth.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Cek apakah plan yang diminta lebih tinggi dari sekarang
    if (!isPlanHigher(plan, user.role)) {
      return NextResponse.json(
        { error: `Kamu sudah berada di plan ${user.role} atau lebih tinggi.` },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada pending upgrade order
    const { data: existingOrder } = await supabaseAdmin
      .from("plan_orders")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("status", "pending")
      .single();

    if (existingOrder) {
      return NextResponse.json(
        { error: "Kamu sudah memiliki upgrade order yang sedang menunggu konfirmasi." },
        { status: 409 }
      );
    }

    const planInfo = PLANS[plan];

    // Buat upgrade order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("plan_orders")
      .insert({
        user_id: auth.user.id,
        plan,
        status:  "pending",
        price:   planInfo.price,
        note:    note?.trim() || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Create upgrade order error:", orderError);
      return NextResponse.json({ error: "Gagal membuat upgrade order." }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: `Upgrade ke ${planInfo.name} berhasil diminta. Admin akan mengkonfirmasi pembayaran kamu.`,
        order,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/upgrade error:", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

/**
 * GET /api/upgrade
 * Ambil riwayat upgrade order milik user yang login
 */
export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("plan_orders")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil riwayat upgrade." }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
