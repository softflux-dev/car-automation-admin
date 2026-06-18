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

const safeParse = (dateStr) => {
  try {
    const d = parseISO(dateStr);
    return isNaN(d.getTime()) ? new Date(dateStr) : d;
  } catch {
    return new Date(dateStr);
  }
};

const isAllDayEvent = (event) => {
  if (event.allDay) return true;
  if (!event.start || !event.end) return false;
  const start = safeParse(event.start);
  const end = safeParse(event.end);
  const diffHours = (end - start) / (1000 * 60 * 60);
  return diffHours >= 24;
};

const now = new Date();

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
    const list = Array.isArray(events) ? events.filter((ev) => !isAllDayEvent(ev)) : [];
    const map = {};
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map[key] = list.filter((ev) => {
        const evDate = safeParse(ev.start);
        return isSameDay(evDate, day);
      });
    });
    return map;
  }, [days, events]);

  const allDayEventsByDay = useMemo(() => {
    const list = Array.isArray(events) ? events.filter((ev) => isAllDayEvent(ev)) : [];
    const map = {};
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map[key] = list.filter((ev) => {
        const evDate = safeParse(ev.start);
        return isSameDay(evDate, day);
      });
    });
    return map;
  }, [days, events]);

  const getOverlapGroups = (dayEvents) => {
    if (dayEvents.length === 0) return [];

    const sorted = [...dayEvents].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    const groups = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const prevEnd = new Date(prev.end).getTime();
      const currStart = new Date(curr.start).getTime();

      if (currStart < prevEnd) {
        currentGroup.push(curr);
      } else {
        groups.push(currentGroup);
        currentGroup = [curr];
      }
    }
    groups.push(currentGroup);

    return groups;
  };

  const getEventStyle = (event, index, groupSize) => {
    const start = safeParse(event.start);
    const end = safeParse(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - MIN_HOUR) * HOUR_HEIGHT;
    const height = Math.max((endHour - startHour) * HOUR_HEIGHT, HOUR_HEIGHT / 4);
    const width = groupSize > 1 ? `${100 / groupSize}%` : "calc(100% - 4px)";
    const left = groupSize > 1 ? `${(index / groupSize) * 100}%` : "2px";

    return {
      top: `${top}px`,
      height: `${height}px`,
      width,
      left,
    };
  };

  const shouldDimHour = (day, hour) => {
    if (!isToday(day)) {
      const dayDate = new Date(day);
      const today = new Date();
      return dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    return hour < now.getHours();
  };

  return (
    <div className="premium-card p-0 overflow-hidden shadow-sm border border-border/60">
      {/* Day headers */}
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
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* All-day events bar */}
              {allDayEventsByDay[format(day, "yyyy-MM-dd")]?.length > 0 && (
                <div className="px-0.5 space-y-0.5 py-1 border-b border-border/30 bg-muted/10 min-h-[28px]">
                  {allDayEventsByDay[format(day, "yyyy-MM-dd")].map((ev) => (
                    <button
                      key={ev.id || ev._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      className="block w-full text-left truncate rounded-sm px-1 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border-l-[2px] border-blue-500 hover:bg-blue-100 transition-colors"
                    >
                      {ev.summary || ev.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex overflow-auto scrollbar-thin" style={{ maxHeight: "calc(100dvh - 280px)" }}>
        <div className="w-14 lg:w-16 shrink-0 border-r border-border/50 bg-white sticky left-0 z-10">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-border/30 pr-1 lg:pr-2 flex justify-end"
            >
              <span className="text-[10px] lg:text-xs text-muted-foreground -translate-y-1/2 select-none leading-none">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 min-w-[560px]">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay[dayKey] || [];
            const overlapGroups = getOverlapGroups(dayEvents);
            const isPastDay = !isToday(day) && day < new Date(now.getFullYear(), now.getMonth(), now.getDate());

            return (
              <div
                key={day.toISOString()}
                className={`relative border-r border-border/30 last:border-r-0 ${
                  isPastDay ? "bg-muted/5" : ""
                }`}
              >
                {HOURS.map((hour) => {
                  const isPastSlot = shouldDimHour(day, hour);

                  return (
                    <TimeSlot
                      key={`${dayKey}-${hour}`}
                      time={`${hour.toString().padStart(2, "0")}:00`}
                      date={day}
                      onClick={onSlotClick}
                      isPast={isPastSlot}
                    />
                  );
                })}

                {overlapGroups.map((group) =>
                  group.map((event, idx) => {
                    const groupSize = group.length;
                    const overlappingCount = group.filter(
                      (e) =>
                        new Date(e.start) < new Date(group[idx].end) &&
                        new Date(e.end) > new Date(group[idx].start)
                    ).length;

                    return (
                      <EventCard
                        key={event.id || event._id}
                        event={event}
                        onClick={onEventClick}
                        style={getEventStyle(event, idx, overlappingCount)}
                      />
                    );
                  })
                )}

                {/* Today line indicator */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${now.getHours() * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary -ml-1 shadow-sm" />
                      <div className="flex-1 h-[2px] bg-primary/70" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default CalendarGrid;
