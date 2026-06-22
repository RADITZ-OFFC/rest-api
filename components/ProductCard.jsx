import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categoryIcon = {
  weather: "🌤️", sms: "📱", identity: "🪪",
  finance: "💳", media: "🎬", utility: "🔧", default: "⚡",
};

const categoryColor = {
  weather: "from-blue-500/20 to-cyan-500/10",
  sms: "from-green-500/20 to-emerald-500/10",
  identity: "from-orange-500/20 to-amber-500/10",
  finance: "from-purple-500/20 to-violet-500/10",
  media: "from-pink-500/20 to-rose-500/10",
  utility: "from-primary/20 to-muted/10",
  default: "from-primary/15 to-secondary/10",
};

export default function ProductCard({ product }) {
  const icon = categoryIcon[product.category] || categoryIcon.default;
  const gradient = categoryColor[product.category] || categoryColor.default;
  const lowestPackage = product.packages?.sort((a, b) => a.price - b.price)[0];

  return (
    <div className="card-hover group flex flex-col gap-0 overflow-hidden p-0">
      {/* Top banner */}
      <div className={`bg-gradient-to-r ${gradient} px-5 pt-5 pb-4 flex items-start justify-between`}>
        <div className="text-3xl">{icon}</div>
        <span className="badge-active text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          Live
        </span>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-text-primary text-sm leading-tight">{product.name}</h3>
          </div>
          <span className="badge-primary text-[10px]">{product.category}</span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Packages preview */}
        {product.packages?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {product.packages.slice(0, 3).map((pkg) => (
              <span key={pkg.id} className="text-[10px] text-text-faint bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                {pkg.name}
              </span>
            ))}
            {product.packages.length > 3 && (
              <span className="text-[10px] text-text-faint bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                +{product.packages.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-1">
          <div>
            <p className="text-[10px] text-text-faint">Mulai dari</p>
            <p className="text-sm font-bold text-primary">
              {lowestPackage ? `Rp ${lowestPackage.price.toLocaleString("id-ID")}` : "Hubungi Admin"}
            </p>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors group-hover:gap-2.5 duration-200"
          >
            Beli Akses <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
