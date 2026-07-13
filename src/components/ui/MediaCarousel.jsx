import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBLE_THUMBS = 4;

const getVideoThumbnail = () => {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 0, 200, 100);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Video", 100, 50);
  return canvas.toDataURL();
};

const getThumbSource = (item) => {
  if (item?.type === "video") return item.thumbnail || getVideoThumbnail();
  return item?.thumbnail ?? item?.src ?? "";
};

export function MediaCarousel({ media = [], onMediaClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const mobileStripRef = useRef(null);

  if (!media.length) return null;

  const safeActiveIndex = Math.min(activeIndex, media.length - 1);
  const maxThumbOffset = Math.max(media.length - VISIBLE_THUMBS, 0);
  const safeThumbOffset = Math.min(thumbOffset, maxThumbOffset);
  const activeItem = media[safeActiveIndex];
  const canScrollUp = safeThumbOffset > 0;
  const canScrollDown = safeThumbOffset + VISIBLE_THUMBS < media.length;

  const handleThumbClick = (item, index) => {
    setActiveIndex(index);
    if (item.type === "video") onMediaClick?.(item);
  };

  const handleHeroClick = () => {
    if (activeItem) onMediaClick?.(activeItem);
  };

  const scrollMobileThumbnails = (direction) => {
    if (!mobileStripRef.current) return;

    mobileStripRef.current.scrollBy({
      left: direction * 160,
      behavior: "smooth",
    });
  };

  const desktopItems = media.slice(
    safeThumbOffset,
    safeThumbOffset + VISIBLE_THUMBS
  );

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <button
        className="group relative min-h-[280px] flex-1 overflow-hidden rounded-2xl bg-muted sm:min-h-[380px] lg:min-h-[480px] xl:min-h-[560px]"
        onClick={handleHeroClick}
        aria-label="Volledig scherm bekijken"
      >
        {activeItem?.type === "video" ? (
          <video
            key={activeItem.src}
            src={activeItem.src}
            poster={activeItem.thumbnail}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <img
            src={getThumbSource(activeItem)}
            alt={activeItem?.alt ?? "Project media"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {activeItem?.type === "video" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl">
              <Play className="ml-1 h-6 w-6 fill-primary text-primary" />
            </div>
          </div>
        )}
      </button>

      <div className="rounded-2xl border border-border bg-white p-3 lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-subtitle">
            Media selecteren
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollMobileThumbnails(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-subtitle transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Scroll thumbnails naar links"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollMobileThumbnails(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-subtitle transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Scroll thumbnails naar rechts"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={mobileStripRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((item, index) => (
            <button
              key={`${item.type}-${item.src}-${index}`}
              onClick={() => handleThumbClick(item, index)}
              className={cn(
                "relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border bg-white transition-all sm:h-28 sm:w-36",
                safeActiveIndex === index
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-primary/40"
              )}
              aria-label={`Thumbnail ${index + 1}`}
            >
              <img
                src={getThumbSource(item)}
                alt={item.alt ?? ""}
                className="h-full w-full object-cover"
              />
              {item.type === "video" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md">
                    <Play className="ml-0.5 h-4 w-4 fill-primary text-primary" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-white lg:flex lg:w-[240px] lg:min-w-[240px] lg:flex-col xl:w-[280px] xl:min-w-[280px]">
        <button
          onClick={() => setThumbOffset((offset) => Math.max(0, offset - 1))}
          disabled={!canScrollUp}
          className="flex items-center justify-center border-b border-border/50 py-2.5 transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Scroll omhoog"
        >
          <ChevronUp
            className={cn(
              "h-5 w-5",
              canScrollUp ? "text-primary" : "text-subtitle/60"
            )}
          />
        </button>

        <div className="flex flex-1 flex-col divide-y divide-gray-100 overflow-hidden">
          {desktopItems.map((item, index) => {
            const realIndex = safeThumbOffset + index;

            return (
              <button
                key={`${item.type}-${item.src}-${realIndex}`}
                onClick={() => handleThumbClick(item, realIndex)}
                className={cn(
                  "relative flex-1 overflow-hidden transition-all duration-200",
                  safeActiveIndex === realIndex
                    ? "ring-2 ring-inset ring-primary"
                    : "hover:opacity-80"
                )}
                aria-label={`Thumbnail ${realIndex + 1}`}
              >
                <img
                  src={getThumbSource(item)}
                  alt={item.alt ?? ""}
                  className="h-full w-full object-cover"
                  style={{ minHeight: "110px" }}
                />
                {item.type === "video" && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md">
                      <Play className="ml-0.5 h-4 w-4 fill-primary text-primary" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() =>
            setThumbOffset((offset) =>
              Math.min(Math.max(media.length - VISIBLE_THUMBS, 0), offset + 1)
            )
          }
          disabled={!canScrollDown}
          className="flex items-center justify-center border-t border-border/50 py-2.5 transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Scroll omlaag"
        >
          <ChevronDown
            className={cn(
              "h-5 w-5",
              canScrollDown ? "text-primary" : "text-subtitle/60"
            )}
          />
        </button>
      </div>
    </div>
  );
}
