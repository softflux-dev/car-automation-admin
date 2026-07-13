import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ServiceViewDialog({
  open,
  onOpenChange,
  title = "Dienstdetails",
  data = null,
  loading = false,
}) {

  const images = data?.images ?? {};
  const status = data?.details?.Status ?? "";
  const description = data?.details?.Omschrijving ?? "";
  const name = data?.details?.Naam ?? "";
  const date = data?.details?.["Aangemaakt op"] ?? data?.details?.Datum ?? "";


  const extraDetails = Object.entries(data?.details || {}).filter(
    ([key]) => !["Naam", "Omschrijving", "Status", "Aangemaakt op", "Datum"].includes(key)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[var(--radius)] p-0 sm:max-w-[680px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-16">
          <DialogTitle className="text-[1.4rem] font-bold text-title sm:text-2xl">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !data ? null : (
            <div className="space-y-5">
              {/* Image carousel */}
              {images.url && (
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={images?.url}
                    alt="Service Image"
                    className="h-[260px] w-full object-cover sm:h-[300px]"
                  />
                </div>
              )}

              {/* Title + status */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xl font-bold text-title sm:text-2xl">
                    {name}
                  </h3>
                  {date && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-subtitle">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{date}</span>
                    </div>
                  )}
                </div>
                {status && (
                  <Badge
                    className={
                      status === "Actief"
                        ? "shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100"
                        : "shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-subtitle hover:bg-muted/80"
                    }
                  >
                    {status}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {description && (
                <div className="w-full overflow-hidden rounded-2xl bg-muted px-5 py-4">
                  <p className="text-sm sm:text-base leading-7 text-subtitle break-words whitespace-pre-line text-justify">
                    {description}
                  </p>
                </div>
              )}

              {/* Extra detail pills */}
              {extraDetails.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {extraDetails.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-[var(--radius-sm)] bg-muted px-4 py-3"
                    >
                      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtitle">
                        {key}
                      </div>
                      <div className="text-sm font-medium text-title">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
