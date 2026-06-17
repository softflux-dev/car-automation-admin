import { memo, useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  isToday,
} from "date-fns";
import { nl } from "date-fns/locale";
import TimeSlot from "./TimeSlot";
import EventCard from "./EventCard";

const HOUR_HEIGHT = 64;
const MIN_HOUR = 0;
const MAX_HOUR = 23;
const HOURS = Array.from(
  { length: MAX_HOUR - MIN_HOUR + 1 },
  (_, i) => MIN_HOUR + i
);

const CalendarGrid = memo(function CalendarGrid({
  currentDate,
  events,
  onSlotClick,
  onEventClick,
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const eventsByDay = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    const map = {};
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map[key] = list.filter((ev) => {
        const evDate = parseISO(ev.start);
        return isSameDay(evDate, day);
      });
    });
    return map;
  }, [days, events]);

  const getEventStyle = (event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - MIN_HOUR) * HOUR_HEIGHT;
    const height = Math.max((endHour - startHour) * HOUR_HEIGHT, HOUR_HEIGHT / 4);
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="premium-card p-0 overflow-hidden">
      <div className="flex">
        <div className="w-14 lg:w-16 shrink-0 border-r border-border/50" />

        <div className="flex-1 grid grid-cols-7">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="border-r border-border/30 last:border-r-0"
            >
              <div
                className={`h-12 flex flex-col items-center justify-center border-b border-border/30 ${
                  isToday(day) ? "bg-primary/5" : ""
                }`}
              >
                <span className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wide">
                  {format(day, "EEEEEE", { locale: nl })}
                </span>
                <span
                  className={`text-sm lg:text-base font-bold leading-tight ${
                    isToday(day)
                      ? "bg-primary text-white w-7 h-7 flex items-center justify-center rounded-full"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex overflow-auto max-h-[calc(100vh-280px)]">
        <div className="w-14 lg:w-16 shrink-0 border-r border-border/50">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-border/30 pr-1 lg:pr-2 flex items-start justify-end"
            >
              <span className="text-[10px] lg:text-xs text-muted-foreground -mt-2">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay[dayKey] || [];

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-border/30 last:border-r-0"
              >
                {HOURS.map((hour) => (
                  <TimeSlot
                    key={`${dayKey}-${hour}`}
                    time={`${hour.toString().padStart(2, "0")}:00`}
                    date={day}
                    onClick={onSlotClick}
                  />
                ))}

                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    style={getEventStyle(event)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default CalendarGrid;
