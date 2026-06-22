import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await supabaseAdmin
    .from("users").select("id, name, email, role, created_at").eq("id", auth.user.id).single();

  if (error) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ user: data });
}

export async function PATCH(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name } = await request.json();
    const updates = {};
    if (name?.trim()) updates.name = name.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diupdate." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("users").update(updates).eq("id", auth.user.id).select("id, name, email, role").single();

    if (error) return NextResponse.json({ error: "Gagal update profil." }, { status: 500 });
    return NextResponse.json({ message: "Profil berhasil diupdate.", user: data });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
