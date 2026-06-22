export default function PageHeader({ title, subtitle, right }) {
  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0 bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-xs text-text-faint mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
