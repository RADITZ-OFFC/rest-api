import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE /api/keys/:id
export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // Pastikan key milik user ini
    const { data: key } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id")
      .eq("id", params.id)
      .single();

    if (!key || key.user_id !== auth.user.id) {
      return NextResponse.json({ error: "Key tidak ditemukan." }, { status: 404 });
    }

    await supabaseAdmin.from("api_keys").delete().eq("id", params.id);
    return NextResponse.json({ message: "API key berhasil dihapus." });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// PATCH /api/keys/:id — toggle active
export async function PATCH(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { is_active } = await request.json();

    const { data: key } = await supabaseAdmin
      .from("api_keys").select("id, user_id").eq("id", params.id).single();

    if (!key || key.user_id !== auth.user.id) {
      return NextResponse.json({ error: "Key tidak ditemukan." }, { status: 404 });
    }

    await supabaseAdmin.from("api_keys").update({ is_active }).eq("id", params.id);
    return NextResponse.json({ message: "Key diperbarui." });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
