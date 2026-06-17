import { memo } from "react";

const TimeSlot = memo(function TimeSlot({ time, date, onClick }) {
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
      className="h-16 border-b border-border/30 cursor-pointer hover:bg-muted/40 transition-colors relative group"
      onClick={handleClick}
    >
      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
          +
        </span>
      </div>
    </div>
  );
});

export default TimeSlot;
