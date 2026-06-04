import { CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MediaCarousel } from "@/components/ui/MediaCarousel";

const toMediaItems = (data) => {
  if (Array.isArray(data?.media) && data.media.length) {
    return data.media;
  }

  if (Array.isArray(data?.images) && data.images.length) {
    return data.images.map((src, index) => ({
      id: `${src}-${index}`,
      type: "image",
      src,
      thumbnail: src,
      alt: data?.title || `Media ${index + 1}`,
    }));
  }

  return [];
};

export default function ViewDetailsDialog({
  open,
  onOpenChange,
  title = "Details",
  data = null,
}) {
  if (!data) return null;

  const media = toMediaItems(data);
  const status = data.statusLabel || data.details?.Status || "";
  const description =
    data.description ||
    data.details?.Omschrijving ||
    data.details?.Beschrijving ||
    "";
  const date =
    data.date ||
    data.details?.Datum ||
    "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] overflow-hidden rounded-[2.25rem] p-8">
        <DialogHeader className="pr-16">
          <DialogTitle className="text-[1.05rem] font-bold text-[#111111] sm:text-[2rem]">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {media.length > 0 && (
            <div className="overflow-hidden rounded-[1.75rem]">
              <MediaCarousel media={media} />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-[#111111]">
                  {data.title || data.details?.Naam || "Details"}
                </h3>
                {date ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-[#7b7b7b]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{date}</span>
                  </div>
                ) : null}
              </div>
              {status ? (
                <Badge className="rounded-full bg-emerald-500 px-4 py-1 text-sm font-medium text-white hover:bg-emerald-500">
                  {status}
                </Badge>
              ) : null}
            </div>

            {description ? (
              <div className="rounded-[1.75rem] bg-[#f5f5f5] px-6 py-6 text-[1.05rem] leading-relaxed text-[#707070]">
                {description}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(data.details || {})
              .filter(([key]) => !["Naam", "Omschrijving", "Beschrijving", "Datum", "Status"].includes(key))
              .map(([key, value]) => (
                <div key={key} className="rounded-[1.5rem] bg-[#f8f8f8] px-5 py-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
                    {key}
                  </div>
                  <div className="text-sm font-medium text-[#232323]">
                    {String(value)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
