import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// PUT /api/admin/products/:id — update produk
export async function PUT(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { name, description, category, base_url, is_active } = body;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ name, description, category, base_url, is_active })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal mengupdate produk." }, { status: 500 });
    }

    return NextResponse.json({ message: "Produk berhasil diupdate.", product: data }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE /api/admin/products/:id — hapus produk
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: "Gagal menghapus produk." }, { status: 500 });
    }

    return NextResponse.json({ message: "Produk berhasil dihapus." }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
