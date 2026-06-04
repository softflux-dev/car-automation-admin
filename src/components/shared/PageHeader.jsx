import { Button } from "@/components/ui/button";

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
