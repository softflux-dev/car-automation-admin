import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getServicesDropdown } from "@/api/services/servicesService";
import { cn } from "@/lib/utils";

function ServicesMultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  loading,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);

  const toggleSelection = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-left transition-colors hover:bg-[var(--secondary)]/40",
            loading && "pointer-events-none opacity-60"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-[var(--text-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Laden...
            </span>
          ) : selectedLabels.length > 0 ? (
            <span className="truncate text-[var(--title)]">{selectedLabels.join(", ")}</span>
          ) : (
            <span className="text-[var(--text-muted)]">{placeholder}</span>
          )}
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform", open && "rotate-180")} />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={6}
          align="start"
          className="z-[200] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--text-muted)]">Geen diensten beschikbaar</p>
          ) : (
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSelection(option.value)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--title)] transition-colors hover:bg-[var(--secondary)]"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        checked ? "border-primary bg-primary" : "border-[var(--border)] bg-white"
                      )}
                    >
                      {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export default function EditProjectDialog({
  open,
  onOpenChange,
  onSave,
  project = null,
  loading = false,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesDropdown, setServicesDropdown] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingServices(true);
    getServicesDropdown()
      .then((res) => {
        const list = res.data.data?.services ?? res.data.data ?? [];
        setServicesDropdown(list);
      })
      .catch(() => {
        setServicesDropdown([]);
      })
      .finally(() => setLoadingServices(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTitle(project?.title || "");
    setDescription(project?.description || "");
    setVideoUrl(project?.videoUrl || "");
    setStatus(project?.status === "active");
    setSelectedServices(
      (project?.services || []).map((service) =>
        typeof service === "object" ? service._id : service
      )
    );
  }, [open, project]);

  const serviceOptions = servicesDropdown.map((service) => ({
    value: service._id,
    label: service.name,
  }));

  const handleSave = () => {
    onSave({
      title,
      description,
      videoUrl: videoUrl.trim() || null,
      services: selectedServices,
      status: status ? "active" : "inactive",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-6 space-y-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-[var(--title)]">
            {project ? "Project bewerken" : "Nieuw project toevoegen"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--text-muted)]">
            Werk de projectgegevens en gekoppelde diensten bij.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-muted)]">Titel</label>
            <Input
              placeholder="Voer projecttitel in"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-muted)]">Beschrijving</label>
            <Textarea
              placeholder="Korte uitleg van uitgevoerd werk"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-muted)]">Diensten</label>
            <ServicesMultiSelect
              options={serviceOptions}
              selected={selectedServices}
              onChange={setSelectedServices}
              placeholder="Selecteer diensten"
              loading={loadingServices}
            />
            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedServices.map((id) => {
                  const service = servicesDropdown.find((item) => item._id === id);
                  if (!service) return null;

                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {service.name}
                      <button
                        type="button"
                        onClick={() => setSelectedServices((current) => current.filter((value) => value !== id))}
                        className="rounded-full transition-colors hover:text-primary/70"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-muted)]">Video URL (Optioneel)</label>
            <Input
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--title)]">Actief</span>
            <Switch checked={status} onCheckedChange={setStatus} />
          </div>
        </form>

        <DialogFooter className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-6 py-2 text-[var(--title)] hover:bg-[var(--secondary)]"
            disabled={loading}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-full bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Project opslaan...
              </>
            ) : (
              "Project opslaan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
