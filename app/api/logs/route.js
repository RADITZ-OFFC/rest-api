import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const keyId    = searchParams.get("keyId");
    const status   = searchParams.get("status");
    const endpoint = searchParams.get("endpoint");

    if (!keyId) return NextResponse.json({ error: "keyId wajib." }, { status: 400 });

    // Verifikasi key milik user
    const { data: key } = await supabaseAdmin
      .from("api_keys").select("id, user_id").eq("id", keyId).single();

    if (!key || key.user_id !== auth.user.id) {
      return NextResponse.json({ error: "Key tidak ditemukan." }, { status: 404 });
    }

    let query = supabaseAdmin
      .from("usage_logs")
      .select("*")
      .eq("api_key_id", keyId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (endpoint) query = query.ilike("endpoint", `%${endpoint}%`);
    if (status === "success") query = query.lt("status_code", 400);
    if (status === "error")   query = query.gte("status_code", 400);

    const { data: logs, error } = await query;
    if (error) return NextResponse.json({ error: "Gagal mengambil logs." }, { status: 500 });

    return NextResponse.json({ logs: logs || [] });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
