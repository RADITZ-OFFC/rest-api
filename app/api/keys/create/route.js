import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { generateApiKey } from "@/lib/apiKeyGen";

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name, description, productId, expiresAt } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama key wajib diisi." }, { status: 400 });
    }

    const keyValue = generateApiKey();

    const insertData = {
      user_id:     auth.user.id,
      key:         keyValue,
      quota_total: 1000, // default quota
      quota_used:  0,
      is_active:   true,
    };

    if (productId)  insertData.product_id  = productId;
    if (expiresAt)  insertData.expires_at  = new Date(expiresAt).toISOString();
    if (name)       insertData.name        = name.trim();
    if (description) insertData.description = description.trim();

    const { data: key, error } = await supabaseAdmin
      .from("api_keys")
      .insert(insertData)
      .select("*, products(id, name)")
      .single();

    if (error) {
      console.error("Create key error:", error);
      return NextResponse.json({ error: "Gagal membuat API key." }, { status: 500 });
    }

    return NextResponse.json({ message: "API key berhasil dibuat.", key }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
