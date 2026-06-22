import { memo, useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  parseISO,
  isToday,
} from "date-fns";
import { nl } from "date-fns/locale";
import moment from "moment";
import "moment-timezone";
import TimeSlot from "./TimeSlot";
import EventCard from "./EventCard";

const HOUR_HEIGHT = 64;
const MIN_HOUR = 0;
const MAX_HOUR = 23;
const HOURS = Array.from(
  { length: MAX_HOUR - MIN_HOUR + 1 },
  (_, i) => MIN_HOUR + i
);

const amsterdamMoment = (dateStr) => moment.tz(dateStr, "Europe/Amsterdam");

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
        return amsterdamMoment(ev.start).format("YYYY-MM-DD") === key;
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
        return amsterdamMoment(ev.start).format("YYYY-MM-DD") === key;
      });
    });
    return map;
  }, [days, events]);

  const getOverlapGroups = (dayEvents) => {
    if (dayEvents.length === 0) return [];

    const sorted = [...dayEvents].sort(
      (a, b) => amsterdamMoment(a.start).valueOf() - amsterdamMoment(b.start).valueOf()
    );

    const groups = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const prevEnd = amsterdamMoment(prev.end).valueOf();
      const currStart = amsterdamMoment(curr.start).valueOf();

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
    const startM = amsterdamMoment(event.start);
    const endM = amsterdamMoment(event.end);
    const startHour = startM.hours() + startM.minutes() / 60;
    const endHour = endM.hours() + endM.minutes() / 60;
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
    <div className="premium-card p-0 overflow-hidden shadow-[var(--shadow-float)] border border-[var(--border-subtle)] rounded-[var(--radius)] bg-card">
      <div
        className="overflow-auto scroll-smooth scrollbar-thin"
        style={{ maxHeight: "calc(100dvh - 280px)" }}
      >
        {/* Day headers */}
        <div className="flex sticky top-0 z-20 bg-card border-b border-[var(--border-medium)]">
          <div className="w-14 lg:w-16 shrink-0 border-r border-[var(--border-medium)] sticky left-0 z-10 bg-card" />
          <div className="flex-1 grid grid-cols-7 min-w-[560px]">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`border-r border-[var(--border-medium)] last:border-r-0 ${
                  isToday(day) ? "bg-[var(--bg-today-col)]" : ""
                }`}
              >
                <div className="h-12 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    {format(day, "EEEEEE", { locale: nl })}
                  </span>
                  <span
                    className={`text-sm lg:text-base font-bold leading-tight ${
                      isToday(day)
                        ? "bg-primary text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-[0_0_0_3px_var(--primary-glow)]"
                        : "text-foreground/80 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-[var(--primary-subtle)] hover:text-primary"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* All-day events bar */}
                {allDayEventsByDay[format(day, "yyyy-MM-dd")]?.length > 0 && (
                  <div className="px-0.5 space-y-0.5 py-1 border-b border-[var(--border-medium)] bg-muted/10 min-h-[28px]">
                    {allDayEventsByDay[format(day, "yyyy-MM-dd")].map((ev) => (
                      <button
                        key={ev.id || ev._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(ev);
                        }}
                        className="block w-full text-left truncate rounded-[var(--radius-xs)] px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border-l-2 border-primary/70 hover:bg-primary/15 transition-all"
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
        <div className="flex">
          <div className="w-14 lg:w-16 shrink-0 border-r border-[var(--border-medium)] bg-[rgb(var(--background))] sticky left-0 z-10">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-[var(--border-medium)] pr-1 lg:pr-2 flex justify-end"
              >
                <span className="text-[10px] font-medium text-muted-foreground/50 -translate-y-1/2 tracking-wide tabular-nums select-none leading-none">
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
              const isPastDay =
                !isToday(day) &&
                day < new Date(now.getFullYear(), now.getMonth(), now.getDate());

              return (
                <div
                  key={day.toISOString()}
                  className={`relative border-r border-[var(--border-medium)] last:border-r-0 ${
                    isPastDay
                      ? "opacity-60 saturate-50"
                      : isToday(day)
                        ? "bg-[var(--bg-today-col)]"
                        : ""
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
                          amsterdamMoment(e.start).valueOf() < amsterdamMoment(group[idx].end).valueOf() &&
                          amsterdamMoment(e.end).valueOf() > amsterdamMoment(group[idx].start).valueOf(),
                      ).length;

                      return (
                        <EventCard
                          key={event.id || event._id}
                          event={event}
                          onClick={onEventClick}
                          style={getEventStyle(event, idx, overlappingCount)}
                        />
                      );
                    }),
                  )}

                  {/* Today line indicator */}
                  {isToday(day) && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{
                        top: `${now.getHours() * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT}px`,
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-[0_0_0_3px_var(--today-glow)]" />
                        <div className="flex-1 h-px bg-gradient-to-r from-red-500/80 to-red-500/20" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CalendarGrid;
