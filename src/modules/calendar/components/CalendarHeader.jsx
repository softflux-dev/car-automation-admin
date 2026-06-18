import { memo, useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const CalendarHeader = memo(function CalendarHeader({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  onGoToDate,
}) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onToday}
          className="font-medium text-sm px-4"
        >
          Vandaag
        </Button>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="text-base lg:text-lg font-semibold whitespace-nowrap hover:bg-muted/50 px-3 -ml-1"
            >
              {format(weekStart, "d MMMM", { locale: nl })} &ndash;{" "}
              {format(weekEnd, "d MMMM yyyy", { locale: nl })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => {
                if (date) {
                  onGoToDate(date);
                  setDatePickerOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});

export default CalendarHeader;
