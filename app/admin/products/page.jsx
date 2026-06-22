import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import ProductFormModal from "./ProductFormModal";
import AdminProductRow from "./AdminProductRow";
import { Package } from "lucide-react";

async function getProducts() {
  const { data } = await supabaseAdmin
    .from("products").select("*, packages(*)").order("created_at", { ascending: false });
  return data || [];
}

export default async function AdminProductsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") redirect("/login");

  const products = await getProducts();

  return (
    <DashboardLayout user={user} role="admin">
      <PageHeader
        title="KELOLA PRODUK"
        breadcrumb="APISTORE — ADMIN / PRODUK"
        right={<ProductFormModal />}
      />
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <SectionHeader num={1} title="DAFTAR PRODUK" right={`${products.length} PRODUK`} />
        <div className="card">
          {products.length === 0 ? (
            <EmptyState icon={Package} title="BELUM ADA PRODUK" desc="Tambahkan produk API pertama kamu." action={<ProductFormModal />} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>PRODUK</th>
                    <th>KATEGORI</th>
                    <th>PAKET</th>
                    <th>HARGA MULAI</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => <AdminProductRow key={p.id} product={p} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="relative overflow-hidden py-8 border-t border-surface-border mt-8">
          <div className="watermark">APISTORE</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
