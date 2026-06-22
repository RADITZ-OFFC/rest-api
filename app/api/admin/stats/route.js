import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/admin/stats — ringkasan statistik untuk dashboard admin
export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: pendingOrders },
      { count: paidOrders },
      { count: totalKeys },
    ] = await Promise.all([
      supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "user"),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
      supabaseAdmin.from("api_keys").select("*", { count: "exact", head: true }).eq("is_active", true),
    ]);

    // Total revenue dari paid orders
    const { data: revenueData } = await supabaseAdmin
      .from("orders")
      .select("total_price")
      .eq("status", "paid");

    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

    return NextResponse.json(
      {
        stats: {
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
          pendingOrders: pendingOrders || 0,
          paidOrders: paidOrders || 0,
          totalKeys: totalKeys || 0,
          totalRevenue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
