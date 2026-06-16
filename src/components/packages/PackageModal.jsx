import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X, Loader2, Check, ChevronDown } from "lucide-react";
import { packageSchema, packageDefaultValues, PACKAGE_TYPES } from "@/validations/packageSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { getServicesDropdown } from "@/api/services/servicesService";
import { cn } from "@/lib/utils";

const MAX_FEATURES = 20;

const BADGE_OPTIONS = [
  { value: "most_popular", label: "Meest populair" },
  { value: "recommended", label: "Aanbevolen" },
];

// ── Reusable multi-select dropdown ──────────────────────────────────────────
function MultiSelectDropdown({ options, selected, onChange, placeholder, loading, error, emptyText = "Geen opties" }) {
  const [open, setOpen] = useState(false);

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const selectedLabels = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border-0 bg-white px-3 text-sm shadow-none transition-colors hover:bg-white/80",
            error && "ring-2 ring-red-500",
            loading && "opacity-60 pointer-events-none"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-[#b3b3b3]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Laden...
            </span>
          ) : selectedLabels.length > 0 ? (
            <span className="truncate text-[#111111]">{selectedLabels.join(", ")}</span>
          ) : (
            <span className="text-[#b3b3b3]">{placeholder}</span>
          )}
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#9a9a9a] transition-transform", open && "rotate-180")} />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={6}
          align="start"
          className="z-[200] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[#9a9a9a]">{emptyText}</p>
          ) : (
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-[#111111] transition-colors hover:bg-[#f5f5f5]"
                  >
                    <span className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checked ? "border-primary bg-primary" : "border-[#d0d0d0] bg-white"
                    )}>
                      {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </span>
                    {opt.label}
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

// ── Main modal ───────────────────────────────────────────────────────────────
export default function PackageModal({ open, onOpenChange, packageData = null, onSubmit, submitting = false }) {
  const [featureInput, setFeatureInput] = useState("");
  const [servicesDropdown, setServicesDropdown] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const initialized = useRef(false);

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(packageSchema),
    defaultValues: packageDefaultValues,
  });

  const features = useWatch({ control, name: "features" }) || [];
  const selectedServices = useWatch({ control, name: "services" }) || [];
  const selectedBadges = useWatch({ control, name: "highlightBadge" }) || [];
  const isActive = useWatch({ control, name: "isActive" });

  // Fetch services dropdown on open
  useEffect(() => {
    if (!open) return;
    setLoadingServices(true);
    getServicesDropdown()
      .then((res) => {
        const list = res.data.data?.services ?? res.data.data ?? [];
        setServicesDropdown(list);
      })
      .catch(() => {})
      .finally(() => setLoadingServices(false));
  }, [open]);

  // Populate form on edit (only once per modal open)
  useEffect(() => {
    if (!open) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    initialized.current = true;

    if (packageData) {
      // services can be array of objects or array of ids
      const serviceIds = (packageData.services || []).map((s) =>
        typeof s === "object" ? s._id : s
      );
      // highlightBadge can be array or single string (legacy)
      const badges = Array.isArray(packageData.highlightBadge)
        ? packageData.highlightBadge.filter((b) => b && b !== "none")
        : packageData.highlightBadge && packageData.highlightBadge !== "none"
        ? [packageData.highlightBadge]
        : [];

      reset({
        name: packageData.name || "",
        services: serviceIds,
        price: packageData.price != null ? String(packageData.price) : "",
        features: packageData.features || [],
        highlightBadge: badges,
        isActive: packageData.status === "active",
        packageType: Array.isArray(packageData.packageType) ? packageData.packageType[0] : packageData.packageType || "loose",
      });
    } else {
      reset(packageDefaultValues);
    }
    setFeatureInput("");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = (isOpen) => {
    if (submitting) return;
    onOpenChange(isOpen);
    if (!isOpen) {
      initialized.current = false;
      reset(packageDefaultValues);
      setFeatureInput("");
    }
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed || features.length >= MAX_FEATURES) return;
    setValue("features", [...features, trimmed], { shouldValidate: true });
    setFeatureInput("");
  };

  const handleRemoveFeature = (index) => {
    setValue("features", features.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const submitPackage = async (data) => {
    const success = await onSubmit({
      name: data.name,
      services: data.services,
      price: data.price ? Number(data.price) : 0,
      features: data.features,
      highlightBadge: data.highlightBadge,
      status: data.isActive ? "active" : "inactive",
      packageType: data.packageType,
    });
    if (success) handleClose(false);
  };

  const serviceOptions = servicesDropdown.map((s) => ({ value: s._id, label: s.name }));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[680px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[2.25rem] bg-white p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Close
            disabled={submitting}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white opacity-90 transition-opacity hover:opacity-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </DialogPrimitive.Close>

          <div className="px-6 pb-4 pt-6 pr-16">
            <h2 className="text-[1.8rem] font-bold text-[#111111]">
              {packageData ? "Pakket bewerken" : "Nieuw pakket toevoegen"}
            </h2>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-6 pb-6">
            <div className="rounded-[1.9rem] bg-[#f5f5f5] p-5">
              <form
                onSubmit={handleSubmit(submitPackage)}
                className="space-y-5"
              >
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    Pakketnaam
                  </Label>
                  <Input
                    placeholder="Voer pakketnaam in"
                    {...register("name")}
                    className={`h-11 rounded-xl border-0 bg-white text-[#111111] shadow-none placeholder:text-[#b3b3b3] ${errors.name ? "ring-2 ring-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Services multi-select */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    Diensten
                  </Label>
                  <MultiSelectDropdown
                    options={serviceOptions}
                    selected={selectedServices}
                    onChange={(v) =>
                      setValue("services", v, { shouldValidate: true })
                    }
                    placeholder="Selecteer diensten"
                    loading={loadingServices}
                    error={!!errors.services}
                    emptyText="Geen diensten beschikbaar"
                  />
                  {/* Selected service pills */}
                  {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedServices.map((id) => {
                        const svc = servicesDropdown.find((s) => s._id === id);
                        if (!svc) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          >
                            {svc.name}
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  "services",
                                  selectedServices.filter((v) => v !== id),
                                  { shouldValidate: true },
                                )
                              }
                              className="ml-0.5 rounded-full hover:text-primary/70 transition-colors"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {errors.services && (
                    <p className="text-xs text-red-500">
                      {errors.services.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    Prijs (EUR)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Voer prijs in"
                    {...register("price")}
                    className="h-11 rounded-xl border-0 bg-white text-[#111111] shadow-none placeholder:text-[#b3b3b3]"
                  />
                </div>

                {/* Package Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    Pakkettype
                  </Label>
                  <Controller
                    control={control}
                    name="packageType"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-white shadow-none text-[#111111]">
                          <SelectValue placeholder="Selecteer type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PACKAGE_TYPES.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-[#111111]">
                      Kenmerken
                    </Label>
                    <span
                      className={`text-xs ${features.length >= MAX_FEATURES ? "text-red-500" : "text-[#9a9a9a]"}`}
                    >
                      {features.length}/{MAX_FEATURES}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Voeg een kenmerk toe"
                      disabled={features.length >= MAX_FEATURES}
                      className="h-11 rounded-xl border-0 bg-white text-[#111111] shadow-none placeholder:text-[#b3b3b3] disabled:opacity-50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={
                        features.length >= MAX_FEATURES || !featureInput.trim()
                      }
                      className="h-11 w-11 shrink-0 rounded-xl bg-primary px-0 text-white hover:bg-primary/90 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.features && (
                    <p className="text-xs text-red-500">
                      {errors.features.message}
                    </p>
                  )}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {features.map((feature, i) => (
                        <span
                          key={`${feature}-${i}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-[#555]"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(i)}
                            className="text-red-400 transition-colors hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlight badges — checkbox pills */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    Uitgelicht label
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {/* "Geen badge" deselect-all pill */}
                    <button
                      type="button"
                      onClick={() =>
                        setValue("highlightBadge", [], { shouldValidate: true })
                      }
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                        selectedBadges.length === 0
                          ? "border-primary bg-primary text-white"
                          : "border-[#e0e0e0] bg-white text-[#555] hover:border-primary/40",
                      )}
                    >
                      {selectedBadges.length === 0 && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                      Geen badge
                    </button>

                    {BADGE_OPTIONS.map((opt) => {
                      const active = selectedBadges.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? selectedBadges.filter((v) => v !== opt.value)
                              : [...selectedBadges, opt.value];
                            setValue("highlightBadge", next, {
                              shouldValidate: true,
                            });
                          }}
                          className={cn(
                            "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                            active
                              ? "border-primary bg-primary text-white"
                              : "border-[#e0e0e0] bg-white text-[#555] hover:border-primary/40",
                          )}
                        >
                          {active && (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <Switch
                    id="pkg-status"
                    checked={isActive}
                    onCheckedChange={(v) => setValue("isActive", v)}
                  />
                  <Label
                    htmlFor="pkg-status"
                    className="text-sm font-semibold text-primary"
                  >
                    Actief
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={submitting}
                    className="h-12 min-w-[104px] rounded-[1.05rem] border-primary bg-white px-8 text-primary hover:bg-primary/5"
                  >
                    Annuleren
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 min-w-[104px] rounded-[1.05rem] bg-primary px-8 text-white hover:bg-primary/90"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Opslaan"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
