import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, CheckCircle2, Code2, Zap } from "lucide-react";
import BuyPackageForm from "./BuyPackageForm";

async function getProduct(id) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("*, packages(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  return data;
}

export default async function ProductDetailPage({ params }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  const product = await getProduct(params.id);
  if (!product) notFound();

  const sortedPackages = product.packages?.sort((a, b) => a.price - b.price) || [];

  const categoryIcon = {
    weather: "🌤️", sms: "📱", identity: "🪪",
    finance: "💳", media: "🎬", utility: "🔧", default: "⚡",
  };
  const icon = categoryIcon[product.category] || categoryIcon.default;

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark">
      <Navbar user={user} />

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-12 w-full">
        {/* Back button */}
        <Link href="/products" className="btn-ghost mb-8 inline-flex">
          <ArrowLeft size={16} />
          Kembali ke Produk
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div className="card">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-dark border border-muted/20 flex items-center justify-center text-3xl shrink-0">
                  {icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">{product.name}</h1>
                  <span className="badge-primary mt-1 inline-block">{product.category}</span>
                  <span className="badge-active ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
              <p className="text-text-muted leading-relaxed">{product.description}</p>
            </div>

            {/* Base URL */}
            {product.base_url && (
              <div className="card">
                <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Code2 size={16} className="text-primary" />
                  Base URL
                </h2>
                <div className="bg-surface-dark rounded-xl px-4 py-3 border border-muted/10">
                  <code className="text-sm text-secondary font-mono">{product.base_url}</code>
                </div>
                <p className="text-xs text-text-faint mt-3">
                  Sertakan header{" "}
                  <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    X-API-Key: {"<your-api-key>"}
                  </code>{" "}
                  di setiap request.
                </p>
              </div>
            )}

            {/* Features */}
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                Yang Kamu Dapatkan
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  "API key eksklusif milik kamu",
                  "Dashboard monitoring penggunaan",
                  "Kuota sesuai paket yang dipilih",
                  "Dokumentasi lengkap & contoh kode",
                  "Support via admin",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-muted">
                    <CheckCircle2 size={15} className="text-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Packages + Buy */}
          <div className="flex flex-col gap-4">
            <div className="card sticky top-20">
              <h2 className="font-semibold text-text-primary mb-4">Pilih Paket</h2>

              {sortedPackages.length > 0 ? (
                <BuyPackageForm
                  packages={sortedPackages}
                  productId={product.id}
                  user={user}
                />
              ) : (
                <p className="text-text-faint text-sm text-center py-4">
                  Paket belum tersedia. Hubungi admin.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
