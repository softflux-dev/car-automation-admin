import { useEffect } from "react";
import { Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function SuccessModal({ isOpen, onClose, message, autoCloseDelay = 2000 }) {
  useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[520px] rounded-[2.4rem] p-0"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex min-h-[380px] flex-col items-center justify-center px-8 py-10 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[1.65rem] bg-[#e9efff]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-8 w-8" />
            </div>
          </div>
          <p className="max-w-[280px] text-[2.1rem] font-bold leading-none text-[#111111]">
            {message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
