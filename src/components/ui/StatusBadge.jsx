import { cn } from "@/lib/utils";

const statusConfig = {
  nieuw: { label: "Nieuw", className: "bg-success-bg text-success" },
  "in-behandeling": {
    label: "In Behandeling",
    className: "bg-amber-100 text-amber-700",
  },
  voltooid: { label: "Voltooid", className: "bg-success-bg text-success" },
  geannuleerd: { label: "Geannuleerd", className: "bg-destructive/10 text-destructive" },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-muted text-title",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
