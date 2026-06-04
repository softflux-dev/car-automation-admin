import { cn } from "@/lib/utils";

const statusConfig = {
  nieuw: { label: "Nieuw", className: "bg-blue-100 text-blue-700" },
  "in-behandeling": {
    label: "In Behandeling",
    className: "bg-yellow-100 text-yellow-700",
  },
  voltooid: { label: "Voltooid", className: "bg-green-100 text-green-700" },
  geannuleerd: { label: "Geannuleerd", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
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
