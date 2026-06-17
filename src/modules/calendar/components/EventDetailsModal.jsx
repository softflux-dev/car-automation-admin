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
import { CalendarDays, Clock, FileText } from "lucide-react";

const EventDetailsModal = memo(function EventDetailsModal({
  open,
  onClose,
  event,
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
          <DialogTitle>{event.summary || event.title}</DialogTitle>
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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default EventDetailsModal;
