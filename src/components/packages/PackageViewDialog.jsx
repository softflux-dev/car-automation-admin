import { CalendarDays, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[2.25rem] p-0 sm:max-w-[580px]">
        <DialogHeader className="shrink-0 border-b border-[#ececec] px-6 py-5 pr-16">
          <DialogTitle className="text-[1.4rem] font-bold text-[#111111] sm:text-2xl">
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
                  <h3 className="text-xl font-bold text-[#111111] sm:text-2xl">{pkg.name}</h3>
                  {date && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#7b7b7b]">
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
                        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100"
                        : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                    }
                  >
                    {pkg.status === "active" ? "Actief" : "Inactief"}
                  </Badge>
                </div>
              </div>

              {/* Detail pills — price + services */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f5f5f5] px-4 py-3">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">Prijs</div>
                  <div className="text-sm font-medium text-[#232323]">
                    {pkg.price != null ? `€ ${pkg.price}` : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-[#f5f5f5] px-4 py-3">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">Kenmerken</div>
                  <div className="text-sm font-medium text-[#232323]">
                    {Array.isArray(pkg.features) ? pkg.features.length : 0}
                  </div>
                </div>
              </div>

              {/* Services */}
              {services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#111111]">
                    Diensten <span className="font-normal text-[#9a9a9a]">({services.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <span
                        key={s._id}
                        className="inline-flex items-center rounded-full bg-[#f5f5f5] px-3 py-1.5 text-sm font-medium text-[#3e3e3e]"
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
                  <p className="text-sm font-semibold text-[#111111]">
                    Kenmerken <span className="font-normal text-[#9a9a9a]">({pkg.features.length})</span>
                  </p>
                  <div className="rounded-2xl bg-[#f5f5f5] px-4 py-3 space-y-2">
                    {pkg.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#3e3e3e]">
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
