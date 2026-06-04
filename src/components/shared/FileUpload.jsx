import { Upload } from "lucide-react";

export default function FileUpload({
  onFileSelect,
  accept = "image/*",
  label = "Bestand uploaden",
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted p-6 text-center hover:bg-muted/70">
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Klik om een bestand te kiezen
        </span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFileSelect?.(event.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}
