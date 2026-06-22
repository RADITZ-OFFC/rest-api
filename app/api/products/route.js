import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/products — ambil semua produk aktif + packages
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = supabaseAdmin
      .from("products")
      .select("*, packages(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil data produk." }, { status: 500 });
    }

    return NextResponse.json({ products: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
