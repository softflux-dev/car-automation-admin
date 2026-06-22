import { memo } from "react";
import moment from "moment";
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

  const mStart = moment.parseZone(event.start);
  const mEnd = moment.parseZone(event.end);
  const startDate = mStart.format("dddd D MMMM YYYY");
  const startTime = mStart.format("HH:mm");
  const endTime = mEnd.format("HH:mm");

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md shadow-[var(--shadow-modal)] border border-[var(--border-subtle)] rounded-[var(--radius)]">
        <DialogHeader>
          <DialogTitle className="break-words pr-6">
            {event.summary || event.title}
          </DialogTitle>
          <DialogDescription>Evenement details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-primary/70 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{startDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary/70 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {startTime} &ndash; {endTime}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary/70 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {event.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event)}
                className="gap-1.5 border-[var(--border-medium)] hover:bg-[var(--primary-subtle)] hover:text-primary hover:border-primary/30"
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
                className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/40"
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
