import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, name, email, role, created_at")
    .eq("id", auth.user.id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
