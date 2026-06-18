import { memo } from "react";
import { format } from "date-fns";

const EventCard = memo(function EventCard({ event, onClick, style }) {
  const startTime = format(new Date(event.start), "HH:mm");
  const endTime = format(new Date(event.end), "HH:mm");

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className="absolute rounded-md bg-primary/10 border-l-[3px] border-primary px-1.5 py-1 text-left text-xs hover:shadow-md hover:bg-primary/15 active:bg-primary/20 transition-all cursor-pointer overflow-hidden z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      style={style}
    >
      <p className="font-semibold text-primary leading-tight truncate text-[11px] lg:text-xs">
        {event.summary || event.title}
      </p>
      <p className="text-muted-foreground text-[10px] leading-tight mt-0.5 truncate">
        {startTime} &ndash; {endTime}
      </p>
    </button>
  );
});

export default EventCard;
