import { CalendarDays, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PACKAGE_TYPES } from "@/validations/packageSchema";

const BADGE_LABELS = {
  most_popular: "Meest populair",
  recommended: "Aanbevolen",
};

export default function PackageViewDialog({ open, onOpenChange, pkg, loading = false }) {
  const date = pkg?.createdAt
    ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(pkg.createdAt))
    : "";

  // Normalise services — array of objects or ids
  const services = (pkg?.services || []).map((s) =>
    typeof s === "object" ? s : { _id: s, name: s }
  );

  // Normalise highlightBadge — array or single string (legacy)
  const badges = Array.isArray(pkg?.highlightBadge)
    ? pkg.highlightBadge.filter(Boolean)
    : pkg?.highlightBadge
    ? [pkg.highlightBadge]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[var(--radius)] p-0 sm:max-w-[580px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-16">
          <DialogTitle className="text-[1.4rem] font-bold text-title sm:text-2xl">
            Pakketdetails
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !pkg ? null : (
            <div className="space-y-5">
              {/* Title + status + badges */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-title sm:text-2xl">
                    {pkg.name}
                  </h3>
                  {date && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-subtitle">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{date}</span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {badges.map((b) => (
                    <Badge
                      key={b}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      {BADGE_LABELS[b] ?? b}
                    </Badge>
                  ))}
                  <Badge
                    className={
                      pkg.status === "active"
                        ? "rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success"
                        : "rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                    }
                  >
                    {pkg.status === "active" ? "Actief" : "Inactief"}
                  </Badge>
                </div>
              </div>

              {/* Detail pills — price + services */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[var(--radius-sm)] bg-[rgb(245,245,245)] px-4 py-3">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtitle">
                    Prijs
                  </div>
                  <div className="text-sm font-medium text-title">
                    {pkg.price != null ? `€ ${pkg.price}` : "—"}
                  </div>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[rgb(245,245,245)] px-4 py-3">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtitle">
                    Kenmerken
                  </div>
                  <div className="text-sm font-medium text-title">
                    {Array.isArray(pkg.features) ? pkg.features.length : 0}
                  </div>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[rgb(245,245,245)] px-4 py-3">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtitle">
                    Type
                  </div>
                  <div className="text-sm font-medium text-title">
                    {(() => {
                      const val = pkg.packageType;
                      const t = PACKAGE_TYPES.find((p) => p.value === val);
                      return t?.label || "—";
                    })()}
                  </div>
                </div>{" "}
                <div className="rounded-[var(--radius-sm)] bg-[rgb(245,245,245)] px-4 py-3">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtitle">
                    Duur
                  </div>
                  <div className="text-sm font-medium text-title">
                    {pkg.duration != null ? `${pkg.duration} minuten` : "—"}
                  </div>
                </div>
              </div>

              {/* Services */}
              {services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-title">
                    Diensten{" "}
                    <span className="font-normal text-subtitle">
                      ({services.length})
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <span
                        key={s._id}
                        className="inline-flex items-center rounded-full bg-[rgb(245,245,245)] px-3 py-1.5 text-sm font-medium text-title"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-title">
                    Kenmerken{" "}
                    <span className="font-normal text-subtitle">
                      ({pkg.features.length})
                    </span>
                  </p>
                  <div className="rounded-2xl bg-[rgb(245,245,245)] px-4 py-3 space-y-2">
                    {pkg.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-title"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
