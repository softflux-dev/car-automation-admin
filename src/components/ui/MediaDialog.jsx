import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaDialog({ item, onClose }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!item) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [item, handleKey]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* X button — top-right, rounded-lg per image */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
        aria-label="Sluiten"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Media container */}
      <div
        className="relative w-[95vw] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "image" ? (
          <img
            src={item.src}
            alt={item.alt ?? ""}
            className="w-full max-h-[90vh] object-contain rounded-lg"
          />
        ) : (
          <video
            src={item.src}
            poster={item.thumbnail}
            controls
            autoPlay
            className="w-full max-h-[90vh] rounded-lg"
            style={{ accentColor: "#1072B7" }}
          >
            Uw browser ondersteunt geen video weergave.
          </video>
        )}
      </div>
    </div>
  );
}
