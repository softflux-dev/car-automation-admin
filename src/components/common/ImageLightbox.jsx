import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ImageLightbox({ images = [], initialIndex = 0, open, onClose }) {
  const [current, setCurrent] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  // Sync index + reset zoom when opened
  useEffect(() => {
    if (open) {
      setCurrent(initialIndex);
      setZoomed(false);
    }
  }, [open, initialIndex]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    setZoomed(false);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    setZoomed(false);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, prev, next, onClose]);

  if (!open || images.length === 0) return null;

  const hasManyImages = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Afbeeldingsviewer"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="absolute top-4 inset-x-4 z-10 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Counter */}
        <div className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white">
          {current + 1} / {images.length}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Zoom toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Uitzoomen" : "Inzoomen"}
          >
            {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>

          {/* Close */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={onClose}
            aria-label="Sluiten"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Prev arrow */}
      {hasManyImages && (
        <button
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Vorige afbeelding"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* Main image */}
      <div
        className="flex w-full items-center justify-center overflow-hidden px-20"
        style={{ maxHeight: hasManyImages ? "calc(85vh - 110px)" : "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`Afbeelding ${current + 1}`}
          draggable={false}
          className={`max-w-full rounded-xl shadow-2xl object-contain select-none transition-transform duration-300 ${
            zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          style={{ maxHeight: hasManyImages ? "calc(85vh - 110px)" : "85vh" }}
          onClick={() => setZoomed((z) => !z)}
        />
      </div>

      {/* Next arrow */}
      {hasManyImages && (
        <button
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Volgende afbeelding"
        >
          <ChevronRight size={26} />
        </button>
      )}

      {/* Bottom thumbnail strip */}
      {hasManyImages && (
        <div
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrent(idx); setZoomed(false); }}
              className={`h-14 w-20 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                idx === current
                  ? "scale-110 border-white shadow-lg"
                  : "border-white/30 opacity-50 hover:border-white/60 hover:opacity-90"
              }`}
              aria-label={`Ga naar afbeelding ${idx + 1}`}
            >
              <img src={img} alt="" draggable={false} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
