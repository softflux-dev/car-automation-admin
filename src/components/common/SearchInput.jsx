import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchInput({
  placeholder = "Zoekopdracht...",
  value,
  onChange,
  onClear,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-ui pl-9 pr-8 h-10 text-sm placeholder:text-[var(--text-muted)] focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-title transition-colors"
          aria-label="Zoekopdracht wissen"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
