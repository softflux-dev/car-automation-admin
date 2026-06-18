import { memo } from "react";

const TimeSlot = memo(function TimeSlot({ time, date, onClick, isPast }) {
  const handleClick = () => {
    const [hours, minutes] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    onClick({ start, end, date });
  };

  return (
    <div
      className={`h-16 border-b border-border/30 cursor-pointer hover:bg-muted/40 active:bg-muted/60 transition-colors relative group ${
        isPast ? "opacity-40" : ""
      }`}
      onClick={!isPast ? handleClick : undefined}
    >
      <div className="opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full ring-1 ring-primary/20 shadow-xs">
          +
        </span>
      </div>
      <div className="md:hidden absolute top-1 right-1 opacity-30">
        <span className="text-[8px] text-primary font-bold">+</span>
      </div>
    </div>
  );
});

export default TimeSlot;
