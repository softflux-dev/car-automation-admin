import { useState, useEffect, useCallback, memo } from "react";
import { format, addMinutes, isPast as isDatePast } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const DURATION_PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 uur", minutes: 60 },
  { label: "2 uur", minutes: 120 },
  { label: "3 uur", minutes: 180 },
];

const CreateEventModal = memo(function CreateEventModal({
  open,
  onClose,
  onSubmit,
  prefilledSlot,
  prefilledTitle,
  prefilledDescription,
  loading,
  isEditing = false,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (prefilledSlot) {
        setStartDate(prefilledSlot.start);
        setEndDate(prefilledSlot.end);
        setStartTime(format(prefilledSlot.start, "HH:mm"));
        setEndTime(format(prefilledSlot.end, "HH:mm"));
      }
      if (prefilledTitle !== undefined) setTitle(prefilledTitle);
      if (prefilledDescription !== undefined) setDescription(prefilledDescription);
    }
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(null);
    setStartTime("");
    setEndDate(null);
    setEndTime("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const applyDuration = useCallback((minutes) => {
    if (startDate && startTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const s = new Date(startDate);
      s.setHours(sh, sm, 0, 0);
      const e = addMinutes(s, minutes);
      setEndDate(e);
      setEndTime(format(e, "HH:mm"));
    }
  }, [startDate, startTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Titel is verplicht";
    if (!startDate) newErrors.startDate = "Startdatum is verplicht";
    if (!startTime) newErrors.startTime = "Starttijd is verplicht";
    if (!endDate) newErrors.endDate = "Einddatum is verplicht";
    if (!endTime) newErrors.endTime = "Eindtijd is verplicht";

    if (startDate && endDate && startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const s = new Date(startDate);
      s.setHours(sh, sm, 0, 0);
      const e = new Date(endDate);
      e.setHours(eh, em, 0, 0);

      if (isDatePast(s)) {
        newErrors.startTime = "Startdatum of -tijd ligt in het verleden";
      }

      if (e <= s) {
        newErrors.endTime = "Eindtijd moet na starttijd liggen";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fmtDate = (d) => format(d, "yyyy-MM-dd");
    const toTz = (d, t) => {
      const offset = -d.getTimezoneOffset();
      const sign = offset >= 0 ? "+" : "-";
      const pad = (n) => n.toString().padStart(2, "0");
      const tz = `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
      return `${fmtDate(d)}T${t}:00${tz}`;
    };
    const payload = {
      summary: title.trim(),
      description: description.trim(),
      startDateTime: toTz(startDate, startTime),
      endDateTime: toTz(endDate, endTime),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Evenement bewerken" : "Evenement aanmaken"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Pas de gegevens van het evenement aan."
              : "Vul de gegevens in om een nieuwe afspraak te maken."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">
              Titel <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel van het evenement"
              className={cn(
                "bg-[rgb(var(--input))] border-0 focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]",
                errors.title && "ring-2 ring-destructive"
              )}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschrijving (optioneel)"
              rows={3}
              maxLength={500}
              className="bg-[rgb(var(--input))] border-0 focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[rgb(var(--input))] border-0 hover:bg-muted/80",
                      !startDate && "text-muted-foreground",
                      errors.startDate && "ring-2 ring-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {startDate ? (
                      format(startDate, "d MMM yyyy", { locale: nl })
                    ) : (
                      <span>Kies datum</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cn(
                  "bg-[rgb(var(--input))] border-0 focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]",
                  errors.startTime && "ring-2 ring-destructive"
                )}
              />
              {(errors.startDate || errors.startTime) && (
                <p className="text-xs text-destructive">
                  {errors.startDate || errors.startTime}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Eind</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[rgb(var(--input))] border-0 hover:bg-muted/80",
                      !endDate && "text-muted-foreground",
                      errors.endDate && "ring-2 ring-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {endDate ? (
                      format(endDate, "d MMM yyyy", { locale: nl })
                    ) : (
                      <span>Kies datum</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cn(
                  "bg-[rgb(var(--input))] border-0 focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]",
                  errors.endTime && "ring-2 ring-destructive"
                )}
              />
              {(errors.endDate || errors.endTime) && (
                <p className="text-xs text-destructive">
                  {errors.endDate || errors.endTime}
                </p>
              )}
            </div>
          </div>

          {startDate && startTime && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Snelle duur
              </Label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <Button
                    key={preset.minutes}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyDuration(preset.minutes)}
                    className="text-xs bg-[rgb(var(--input))] border-0 hover:bg-muted/80"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-5"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-100 disabled:cursor-wait"
            >
              {loading ? "Bezig..." : isEditing ? "Bijwerken" : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default CreateEventModal;
