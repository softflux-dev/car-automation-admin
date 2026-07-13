export function DetailField({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-subtitle uppercase tracking-wider flex items-center gap-1">
        {icon && <span className="text-subtitle">{icon}</span>}
        {label}
      </span>
      <div className="rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm font-medium text-title truncate">
        {value ?? "—"}
      </div>
    </div>
  );
}
