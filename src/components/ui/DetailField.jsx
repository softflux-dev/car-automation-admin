export function DetailField({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </span>
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 truncate">
        {value ?? "—"}
      </div>
    </div>
  );
}
