import { memo } from "react";
import moment from "moment";

const EventCard = memo(function EventCard({ event, onClick, style }) {
  const startTime = moment.parseZone(event.start).format("HH:mm");
  const endTime = moment.parseZone(event.end).format("HH:mm");

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className="absolute rounded-[var(--radius-sm)] px-2 py-1.5 text-left cursor-pointer overflow-hidden z-10 bg-gradient-to-br from-primary/[0.12] to-primary/[0.07] border border-primary/20 border-l-[3px] border-l-primary shadow-[var(--shadow-event)] hover:shadow-[var(--shadow-event-hover)] hover:scale-[1.01] hover:-translate-y-px hover:bg-gradient-to-br hover:from-primary/[0.16] hover:to-primary/[0.10] active:scale-[0.99] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-[var(--radius-sm)]" />
      <p className="font-semibold text-primary text-[11px] lg:text-xs leading-tight truncate relative">
        {event.summary || event.title}
      </p>
      <p className="text-primary/50 text-[10px] leading-tight mt-0.5 truncate font-medium relative">
        {startTime} &ndash; {endTime}
      </p>
    </button>
  );
});

export default EventCard;
