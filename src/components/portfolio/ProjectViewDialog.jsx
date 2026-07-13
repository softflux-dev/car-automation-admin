import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getServicesDropdown } from "@/api/services/servicesService";

export default function ProjectViewDialog({
  open,
  onOpenChange,
  project,
  loading = false,
}) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [servicesDropdown, setServicesDropdown] = useState([]);

  const media = project?.media ?? [];
  const title = project?.title ?? "";
  const description = project?.description ?? "";
  const status = project?.status ?? "";
  const services = project?.services ?? [];
  const date = project?.createdAt
    ? new Intl.DateTimeFormat("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(project.createdAt))
    : "";

  useEffect(() => {
    if (!open) return;
    getServicesDropdown()
      .then((res) => {
        const list = res.data.data?.services ?? res.data.data ?? [];
        setServicesDropdown(list);
      })
      .catch(() => {
        setServicesDropdown([]);
      });
  }, [open]);

  useEffect(() => {
    setMediaIndex(0);
  }, [project?._id]);

  const normalizedServices = services
    .map((service) => {
      if (typeof service === "object" && service?.name) {
        return { _id: service._id ?? service.name, name: service.name };
      }

      const matchedService = servicesDropdown.find(
        (item) => item._id === service,
      );
      return matchedService
        ? { _id: matchedService._id, name: matchedService.name }
        : null;
    })
    .filter(Boolean);

  const prev = () =>
    setMediaIndex((i) => (i - 1 + media.length) % media.length);
  const next = () => setMediaIndex((i) => (i + 1) % media.length);
  const current = media[mediaIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[var(--radius)] p-0 sm:max-w-[680px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-16">
          <DialogTitle className="text-[1.4rem] font-bold text-title sm:text-2xl">
            Projectdetails
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !project ? null : (
            <div className="space-y-5">
              {/* Media carousel */}
              {media.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  {current?.type === "video" ? (
                    <video
                      src={current.url}
                      controls
                      className="h-[260px] w-full object-cover sm:h-[300px]"
                    />
                  ) : (
                    <img
                      src={current?.url}
                      alt={`${title} ${mediaIndex + 1}`}
                      className="h-[260px] w-full object-cover sm:h-[300px]"
                    />
                  )}

                  {current?.type === "video" && (
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                      <Play className="h-3 w-3" /> Video
                    </div>
                  )}

                  {media.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                      >
                        <ChevronLeft className="h-5 w-5 text-title" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                      >
                        <ChevronRight className="h-5 w-5 text-title" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {media.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => setMediaIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === mediaIndex ? "w-5 bg-white" : "w-2 bg-white/60"}`}
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
                  <h3 className="truncate text-xl font-bold text-title sm:text-2xl">
                    {title}
                  </h3>
                  {date && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-subtitle">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{date}</span>
                    </div>
                  )}
                </div>
                <Badge
                  className={
                    status === "active"
                      ? "shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100"
                      : "shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-subtitle hover:bg-muted/80"
                  }
                >
                  {status === "active" ? "Actief" : "Inactief"}
                </Badge>
              </div>

              {/* Description */}
              {description && (
                <div className="w-full overflow-hidden rounded-2xl bg-muted px-5 py-4">
                  <p className="text-sm sm:text-base leading-7 text-title break-words whitespace-pre-line text-justify">
                    {description}
                  </p>
                </div>
              )}
              {normalizedServices.length > 0 && (
                <div className="rounded-[var(--radius-sm)] border border-border bg-gradient-to-br from-[#fffaf0] via-[#fff7e8] to-[#f8efe0] px-5 py-4 shadow-[0_10px_30px_rgba(17,17,17,0.05)]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-title">
                        Diensten{" "}
                        <span className="font-normal text-subtitle">
                          ({normalizedServices.length})
                        </span>
                      </p>
                      <p className="text-xs text-subtitle">
                        Gekoppeld aan dit portfolio-item
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {normalizedServices.map((service) => (
                      <span
                        key={service._id}
                        className="inline-flex items-center rounded-full border border-white/80 bg-white/85 px-3.5 py-1.5 text-sm font-medium text-title shadow-sm backdrop-blur"
                      >
                        {service.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                {project.videoUrl && (
                  <div className="rounded-[var(--radius-sm)] bg-muted px-4 py-3">
                    <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtitle">
                      Video URL
                    </div>
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs font-medium text-primary hover:underline"
                    >
                      {project.videoUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
