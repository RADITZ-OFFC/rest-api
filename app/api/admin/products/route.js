import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/admin/products — semua produk (termasuk tidak aktif)
export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, packages(*)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil produk." }, { status: 500 });
    }

    return NextResponse.json({ products: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// POST /api/admin/products — tambah produk baru
export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, description, category, base_url, is_active = true, packages = [] } =
      await request.json();

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "Nama, deskripsi, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    // Insert produk
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({ name, description, category, base_url, is_active })
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: "Gagal menambah produk." }, { status: 500 });
    }

    // Insert packages jika ada
    if (packages.length > 0) {
      const pkgData = packages.map((pkg) => ({
        ...pkg,
        product_id: product.id,
      }));

      const { error: pkgError } = await supabaseAdmin.from("packages").insert(pkgData);
      if (pkgError) {
        console.error("Insert packages error:", pkgError);
      }
    }

    return NextResponse.json({ message: "Produk berhasil ditambahkan.", product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
