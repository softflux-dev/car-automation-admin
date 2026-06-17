import { memo } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarHeader = memo(function CalendarHeader({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onToday,
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onToday}
          className="font-medium text-sm"
        >
          Vandaag
        </Button>
        <div className="flex items-center gap-1">
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
        <h2 className="text-base lg:text-lg font-semibold whitespace-nowrap">
          {format(weekStart, "d MMMM", { locale: nl })} &ndash;{" "}
          {format(weekEnd, "d MMMM yyyy", { locale: nl })}
        </h2>
      </div>
    </div>
  );
});

export default CalendarHeader;
