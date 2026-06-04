import { cn } from "@/lib/utils";
import { Button } from "./button";

export function BrandButton({ children, className, ...props }) {
  return (
    <Button
      className={cn(
        "btn-primary px-6 text-sm font-semibold",
        className
      )}
      style={{
        background: "linear-gradient(271.53deg, #88C8F7 5.9%, #1072B7 77.5%)",
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
