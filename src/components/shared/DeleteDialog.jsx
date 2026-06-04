import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteDialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  onConfirm,
  title = "Item verwijderen",
  description,
  warning,
  message,
  confirmText = "Verwijderen",
  cancelText = "Annuleren",
  loading = false,
}) {
  const resolvedOpen = typeof open === "boolean" ? open : !!isOpen;
  const resolvedDescription =
    description ||
    message ||
    "Weet u zeker dat u dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.";
    const resolvedWarning = warning || "Deze actie kan niet ongedaan worden gemaakt.";

  const handleOpenChange = (nextOpen) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[920px] rounded-[2.25rem] p-8 sm:p-8">
        <DialogHeader className="pr-16">
          <DialogTitle className="text-[1.05rem] font-bold text-[#111111] sm:text-[2rem]">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-[1.75rem] bg-[#f5f5f5] px-6 py-5">
          <div className="flex items-start gap-5">
            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-[#ffe8e8]">
              <AlertTriangle className="h-7 w-7 text-[#ff1f1f]" />
            </div>
            <DialogDescription className="pt-1 text-xl leading-tight text-[#6f6f6f] ">
              {resolvedDescription}
            </DialogDescription>
          </div>
        </div>

        {resolvedWarning && (
          <div className="rounded-[1.75rem] bg-red-100 px-6 py-5">
            <p className="text-sm leading-relaxed text-gray-700 font-medium">
              {resolvedWarning}
            </p>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="h-12 min-w-[138px] rounded-[1.1rem] border-primary bg-white px-7 text-base font-medium text-primary hover:bg-primary/5"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-12 min-w-[138px] rounded-[1.1rem] bg-primary px-7 text-base font-medium text-white hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Bezig..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
