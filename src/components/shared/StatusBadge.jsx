import { cn } from "@/lib/utils";

export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const isActive = normalized === "actief" || normalized === "active";

  return (
    <span
      className={cn(
        "px-3 py-0.5 rounded-full text-sm border",
        isActive
          ? "border-success text-success bg-success-bg"
          : "border-muted-foreground text-muted-foreground bg-muted"
      )}
    >
      {isActive ? "Actief" : "Inactief"}
    </span>
  );
}
