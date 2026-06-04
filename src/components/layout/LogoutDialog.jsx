import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function LogoutDialog({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white rounded-2xl border-none shadow-xl">
        <div className="flex flex-col items-center px-6 py-8 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[var(--secondary)] mb-6">
            <LogOut className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-[var(--title)] mb-2">
            Uitloggen
          </h2>

          {/* Text */}
          <p className="text-[var(--text-muted)] mb-6">
            Weet u zeker dat u wilt uitloggen?
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 rounded-full border-[var(--border)] text-[var(--title)] hover:bg-[var(--secondary)]"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </Button>
            <Button
              className="flex-1 rounded-full bg-primary text-white hover:bg-primary/90"
              onClick={onConfirm}
            >
              Ja, uitloggen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
