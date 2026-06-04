import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function CertificateViewDialog({
  open,
  onOpenChange,
  title = "Certificaatdetails",
  data = null,
  loading = false,
}) {
  const [imgIndex, setImgIndex] = useState(0);

  const images = data?.images ?? [];
  const status = data?.details?.Status ?? "";
  const description = data?.details?.Omschrijving ?? "";
  const name = data?.details?.Naam ?? "";
  const date = data?.details?.Datum ?? data?.details?.["Aangemaakt op"] ?? "";

  const extraDetails = Object.entries(data?.details || {}).filter(
    ([key]) => !["Naam", "Omschrijving", "Status", "Datum", "Aangemaakt op"].includes(key)
  );

  const prev = () => setImgIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIndex((i) => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[2.25rem] p-0 sm:max-w-[680px]">
        <DialogHeader className="shrink-0 border-b border-[#ececec] px-6 py-5 pr-16">
          <DialogTitle className="text-[1.4rem] font-bold text-[#111111] sm:text-2xl">
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
              {images.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f5]">
                  <img
                    src={images[imgIndex]}
                    alt={`${name} ${imgIndex + 1}`}
                    className="h-[260px] w-full object-cover sm:h-[300px]"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                      >
                        <ChevronLeft className="h-5 w-5 text-[#111111]" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                      >
                        <ChevronRight className="h-5 w-5 text-[#111111]" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === imgIndex ? "w-5 bg-white" : "w-2 bg-white/60"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Title + status */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xl font-bold text-[#111111] sm:text-2xl">{name}</h3>
                  {date && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#7b7b7b]">
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
                        : "shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                    }
                  >
                    {status}
                  </Badge>
                )}
              </div>

                  {/* Description */}
                  {description && (
                    <div className="rounded-2xl bg-[#f5f5f5] px-5 py-4 text-sm leading-relaxed text-[#707070] sm:text-base">
                      {description}
                    </div>
                  )}

              {/* Extra detail pills */}
              {extraDetails.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {extraDetails.map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-[#f5f5f5] px-4 py-3">
                      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
                        {key}
                      </div>
                      <div className="text-sm font-medium text-[#232323]">{String(value)}</div>
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
