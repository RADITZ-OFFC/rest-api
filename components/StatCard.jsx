import clsx from "clsx";

export default function StatCard({ label, value, icon: Icon, color = "primary", subtitle, className }) {
  const colorMap = {
    primary:   { icon: "text-primary",   value: "text-primary" },
    secondary: { icon: "text-secondary", value: "text-secondary" },
    muted:     { icon: "text-muted",     value: "text-muted" },
    white:     { icon: "text-text-muted",value: "text-text-primary" },
    red:       { icon: "text-red-400",   value: "text-red-400" },
    yellow:    { icon: "text-amber-400", value: "text-amber-400" },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={clsx("card flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-faint font-medium">{label}</span>
        {Icon && <Icon size={14} className={c.icon} />}
      </div>
      <p className={clsx("text-2xl font-bold leading-none", c.value)}>{value}</p>
      {subtitle && <p className="text-xs text-text-faint">{subtitle}</p>}
    </div>
  );
}
