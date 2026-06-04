import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function DateInput({
  label,
  name,
  value,
  onChange,
  placeholder = "Selecteer datum",
  error,
}) {
  const [open, setOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-[var(--text-main)]">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "input-ui w-full justify-start text-left font-normal",
              !value && "text-[var(--text-muted)]"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDate(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
