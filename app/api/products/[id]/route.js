import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/products/:id — detail satu produk
export async function GET(request, { params }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, packages(*)")
      .eq("id", params.id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ product: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
