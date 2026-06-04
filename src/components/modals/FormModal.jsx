import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Opslaan",
  cancelLabel = "Annuleren",
  isLoading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Laden..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
