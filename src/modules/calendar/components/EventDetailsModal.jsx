import { memo } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, FileText, Pencil, Trash2, Loader2 } from "lucide-react";

const EventDetailsModal = memo(function EventDetailsModal({
  open,
  onClose,
  event,
  onEdit,
  onDelete,
  deleting = false,
}) {
  if (!event) return null;

  const startDate = format(new Date(event.start), "EEEE d MMMM yyyy", {
    locale: nl,
  });
  const startTime = format(new Date(event.start), "HH:mm");
  const endTime = format(new Date(event.end), "HH:mm");

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="break-words pr-6">
            {event.summary || event.title}
          </DialogTitle>
          <DialogDescription>Evenement details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{startDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {startTime} &ndash; {endTime}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {event.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event)}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Bewerken
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(event)}
                disabled={deleting}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Verwijderen
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default EventDetailsModal;
