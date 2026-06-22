/**
 * Section label style Covenant: [SEK.01] / NAMA SECTION
 * dengan info di kanan
 */
export default function SectionHeader({ num, title, right, color = "primary" }) {
  return (
    <div className="section-header">
      <div className="flex items-center gap-3">
        <span className={color === "green" ? "section-tag-green" : "section-tag"}>
          SEK.{String(num).padStart(2, "0")}
        </span>
        <span className="text-xs font-bold tracking-widest uppercase text-text-muted">
          / {title}
        </span>
      </div>
      {right && (
        <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">
          {right}
        </span>
      )}
    </div>
  );
}
