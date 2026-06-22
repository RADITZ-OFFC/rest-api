import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/keys — semua API key milik user yang login
export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select(`
        *,
        products ( id, name, category, base_url )
      `)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil API key." }, { status: 500 });
    }

    return NextResponse.json({ keys: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/keys error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
