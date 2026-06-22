export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
          <Icon size={18} className="text-text-faint" strokeWidth={1.5} />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-text-muted">{title}</p>
        {description && (
          <p className="text-xs text-text-faint mt-1 max-w-[200px] leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
