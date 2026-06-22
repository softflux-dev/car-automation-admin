import { memo } from "react";
import moment from "moment";
import "moment-timezone";

const TimeSlot = memo(function TimeSlot({ time, date, onClick, isPast }) {
  const handleClick = () => {
    const [hours, minutes] = time.split(":").map(Number);
    const dateStr = moment(date).format("YYYY-MM-DD");
    const start = moment.tz(`${dateStr} ${hours}:${minutes}`, "YYYY-MM-DD HH:mm", "Europe/Amsterdam");
    const end = start.clone().add(1, "hour");
    onClick({
      start: start.toDate(),
      end: end.toDate(),
      startStr: start.format("YYYY-MM-DDTHH:mm:ssZ"),
      endStr: end.format("YYYY-MM-DDTHH:mm:ssZ"),
      date,
    });
  };

  const hourNum = parseInt(time.split(":")[0], 10);
  const isEven = hourNum % 2 === 0;

  return (
    <div
      className={`h-16 border-b border-[var(--bg-grid-line)] cursor-pointer relative group transition-colors duration-150 ${
        isEven ? "bg-[var(--bg-hour-alt)]" : ""
      } ${
        isPast ? "opacity-50 saturate-[0.4]" : "hover:bg-[var(--primary-subtle)] active:bg-[rgb(var(--primary)/0.10)]"
      }`}
      onClick={!isPast ? handleClick : undefined}
    >
      <div className="opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] text-primary font-semibold bg-white border border-primary/20 shadow-sm px-2 py-0.5 rounded-full">
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
