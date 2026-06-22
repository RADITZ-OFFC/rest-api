import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/orders — riwayat order milik user yang login
export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        packages (
          name,
          quota,
          price,
          duration_days,
          products ( name, category )
        )
      `)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil riwayat order." }, { status: 500 });
    }

    return NextResponse.json({ orders: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// POST /api/orders — buat order baru
export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json({ error: "packageId wajib diisi." }, { status: 400 });
    }

    // Ambil data paket
    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from("packages")
      .select("*, products(id, name, is_active)")
      .eq("id", packageId)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 });
    }

    if (!pkg.products?.is_active) {
      return NextResponse.json({ error: "Produk tidak aktif." }, { status: 400 });
    }

    // Buat order dengan status pending
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: auth.user.id,
        package_id: packageId,
        product_id: pkg.products.id,
        status: "pending",
        total_price: pkg.price,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Create order error:", orderError);
      return NextResponse.json({ error: "Gagal membuat order." }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Order berhasil dibuat. Menunggu konfirmasi admin.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
