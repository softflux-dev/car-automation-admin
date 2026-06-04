import { cn } from "@/lib/utils";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconSrc,
  isActive,
  subtitleColor = "text-success",
}) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-300",
        isActive
          ? "border-primary/20 bg-primary text-white shadow-md"
          : "border-border/60 bg-white text-[var(--title)] hover:border-primary/20 hover:bg-primary hover:text-white hover:shadow-md",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold transition-colors duration-300 group-hover:text-white">
          {title}
        </h3>
        <div className="flex h-12 w-12  items-center justify-center rounded-2xl border transition-colors duration-300 group-hover:border-white/25 group-hover:bg-white/10">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt=""
              aria-hidden="true"
              className="h-6 w-6 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
            />
          ) : Icon ? (
            <Icon className="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
          ) : null}
        </div>
      </div>

      <div>
        <div className="font-uber text-4xl font-bold tracking-tight transition-colors duration-300 group-hover:text-white">
          {value}
        </div>
        <div
          className={cn(
            "text-xs font-medium transition-colors duration-300",
            isActive ? "text-white/85" : subtitleColor,
            "group-hover:text-white/85",
          )}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
