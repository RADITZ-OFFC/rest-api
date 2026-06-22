import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Package } from "lucide-react";

const categories = ["Semua", "weather", "sms", "identity", "finance", "media", "utility"];

async function getProducts(category) {
  let query = supabaseAdmin
    .from("products")
    .select("*, packages(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return data || [];
}

export default async function ProductsPage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  const activeCategory = searchParams?.category || "Semua";
  const products = await getProducts(activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-text-primary mb-3">
            Semua <span className="gradient-text">Produk API</span>
          </h1>
          <p className="text-text-muted text-lg">
            Pilih API yang sesuai dengan kebutuhan project kamu.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`/products${cat !== "Semua" ? `?category=${cat}` : ""}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "border-muted/20 text-text-muted hover:text-text-primary hover:border-muted/40 bg-surface"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </a>
          ))}
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-muted/20 flex items-center justify-center mb-4">
              <Package size={28} className="text-text-faint" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Belum ada produk di kategori ini
            </h3>
            <p className="text-text-muted text-sm">Coba pilih kategori lain.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
