import { useState, useEffect, memo } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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

const CreateEventModal = memo(function CreateEventModal({
  open,
  onClose,
  onSubmit,
  prefilledSlot,
  prefilledTitle,
  prefilledDescription,
  loading,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (prefilledSlot) {
      setStartDate(prefilledSlot.start);
      setEndDate(prefilledSlot.end);
      setStartTime(format(prefilledSlot.start, "HH:mm"));
      setEndTime(format(prefilledSlot.end, "HH:mm"));
    }
    if (prefilledTitle !== undefined) setTitle(prefilledTitle);
    if (prefilledDescription !== undefined) setDescription(prefilledDescription);
  }, [prefilledSlot, prefilledTitle, prefilledDescription]);

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
      if (e <= s) {
        newErrors.endTime = "Eindtijd moet na starttijd liggen";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fmtDate = (d) => format(d, "yyyy-MM-dd");
    const payload = {
      summary: title.trim(),
      description: description.trim(),
      startDateTime: `${fmtDate(startDate)}T${startTime}:00`,
      endDateTime: `${fmtDate(endDate)}T${endTime}:00`,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Evenement aanmaken</DialogTitle>
          <DialogDescription>
            Vul de gegevens in om een nieuwe afspraak te maken.
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
              className={errors.title ? "border-destructive" : ""}
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
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                      errors.startDate && "border-destructive"
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
                className={cn(errors.startTime && "border-destructive")}
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
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                      errors.endDate && "border-destructive"
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
                className={cn(errors.endTime && "border-destructive")}
              />
              {(errors.endDate || errors.endTime) && (
                <p className="text-xs text-destructive">
                  {errors.endDate || errors.endTime}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Bezig..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default CreateEventModal;
