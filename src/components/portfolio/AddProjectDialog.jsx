import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Loader2, Trash2, Play, Link, Check, ChevronDown } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import TextareaInput from "@/components/inputs/TextareaInput";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";
import { getServicesDropdown } from "@/api/services/servicesService";
import { cn } from "@/lib/utils";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi", "video/webm", "video/mkv"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

const defaultValues = { title: "", description: "", videoUrl: "", services: [], status: true };

function ServicesMultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  loading,
  error,
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
            "flex h-11 w-full items-center justify-between rounded-xl border-0 bg-white px-3 text-sm shadow-none transition-colors hover:bg-white/80",
            error && "ring-2 ring-red-500",
            loading && "pointer-events-none opacity-60"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-[#b3b3b3]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Laden...
            </span>
          ) : selectedLabels.length > 0 ? (
            <span className="truncate text-left text-[#111111]">{selectedLabels.join(", ")}</span>
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
            <p className="px-3 py-3 text-sm text-[#9a9a9a]">Geen diensten beschikbaar</p>
          ) : (
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSelection(option.value)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-[#111111] transition-colors hover:bg-[#f5f5f5]"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        checked ? "border-primary bg-primary" : "border-[#d0d0d0] bg-white"
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

export default function AddProjectDialog({ open, onOpenChange, project, onSubmit, submitting = false }) {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ defaultValues });
  const status = watch("status");
  const selectedServices = watch("services") || [];
  const isLoading = uploadingImages || uploadingVideo || submitting;

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
    if (open) {
      if (project?._id) {
        const serviceIds = (project.services || []).map((service) =>
          typeof service === "object" ? service._id : service
        );
        reset({
          title: project.title || "",
          description: project.description || "",
          videoUrl: project.videoUrl || "",
          services: serviceIds,
          status: project.status === "active",
        });
        // Show existing media as previews
        const existingImages = (project.media || []).filter((m) => m.type === "image").map((m) => ({ url: m.url, existing: true }));
        setImagePreviews(existingImages);
        setImageFiles([]);
        setVideoFile(null);
        setVideoPreview(null);
      } else {
        reset(defaultValues);
        setImageFiles([]);
        setImagePreviews([]);
        setVideoFile(null);
        setVideoPreview(null);
      }
    }
  }, [project, open, reset]);

  const handleClose = (isOpen) => {
    if (isLoading) return;
    onOpenChange(isOpen);
    if (!isOpen) {
      reset(defaultValues);
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: `"${file.name}" is geen geldig afbeeldingsformaat.`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast({ title: `"${file.name}" overschrijdt de maximale grootte van 10MB.`, variant: "destructive" });
        continue;
      }
      valid.push(file);
    }
    if (!valid.length) return;
    setImageFiles((prev) => [...prev, ...valid]);
    setImagePreviews((prev) => [...prev, ...valid.map((f) => ({ url: URL.createObjectURL(f), existing: false }))]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => {
      // Count existing previews to offset index
      const existingCount = imagePreviews.filter((p) => p.existing).length;
      const fileIndex = index - existingCount;
      if (fileIndex < 0) return prev; // removing an existing image — just remove preview
      return prev.filter((_, i) => i !== fileIndex);
    });
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast({ title: "Ongeldig videoformaat. Gebruik MP4, MOV, AVI, WebM of MKV.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast({ title: "Video overschrijdt de maximale grootte van 200MB.", variant: "destructive" });
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleFormSubmit = async (data) => {
    if (imagePreviews.length === 0) {
      toast({ title: "Voeg minimaal één afbeelding toe.", variant: "destructive" });
      return;
    }

    // Keep existing media
    const existingMedia = (project?.media || []).filter((m) => {
      const stillPresent = imagePreviews.some((p) => p.existing && p.url === m.url);
      return stillPresent;
    });

    let newImageMedia = [];
    if (imageFiles.length > 0) {
      setUploadingImages(true);
      try {
        const results = await Promise.all(imageFiles.map((f) => uploadToCloudinary(f)));
        newImageMedia = results.map((r) => ({ url: r.url, type: "image" }));
      } catch (err) {
        toast({ title: err.message || "Afbeelding uploaden mislukt.", variant: "destructive" });
        setUploadingImages(false);
        return;
      }
      setUploadingImages(false);
    }

    let videoMedia = existingMedia.filter((m) => m.type === "video");
    if (videoFile) {
      setUploadingVideo(true);
      try {
        const result = await uploadToCloudinary(videoFile);
        videoMedia = [{ url: result.url, type: "video" }];
      } catch (err) {
        toast({ title: err.message || "Video uploaden mislukt.", variant: "destructive" });
        setUploadingVideo(false);
        return;
      }
      setUploadingVideo(false);
    }

    const existingImageMedia = existingMedia.filter((m) => m.type === "image");
    const media = [...existingImageMedia, ...newImageMedia, ...videoMedia];

    const success = await onSubmit({
      title: data.title,
      description: data.description,
      media,
      videoUrl: data.videoUrl?.trim() || null,
      services: data.services,
      status: data.status ? "active" : "inactive",
    });

    if (success) {
      handleClose(false);
    }
  };

  const uploadLabel = uploadingImages
    ? "Afbeeldingen uploaden..."
    : uploadingVideo
    ? "Video uploaden..."
    : null;
  const serviceOptions = servicesDropdown.map((service) => ({ value: service._id, label: service.name }));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[680px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[2.25rem] bg-white p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Close
            disabled={isLoading}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white opacity-90 transition-opacity hover:opacity-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </DialogPrimitive.Close>

          <div className="px-6 pb-4 pt-6 pr-16">
            <h2 className="text-[1.8rem] font-bold text-[#111111]">
              {project?._id ? "Project bewerken" : "Nieuw project toevoegen"}
            </h2>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-6 pb-6">
            <div className="rounded-[1.9rem] bg-[#f5f5f5] p-5">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Projectnaam</Label>
                  <Input
                    placeholder="Voer projectnaam in"
                    {...register("title", { required: "Projectnaam is verplicht" })}
                    className={`h-11 rounded-xl border-0 bg-white text-[#111111] shadow-none placeholder:text-[#b3b3b3] ${errors.title ? "ring-2 ring-red-500" : ""}`}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Beschrijving</Label>
                  <TextareaInput
                    name="description"
                    placeholder="Beschrijf het project..."
                    register={register}
                    rows={4}
                    className="w-full resize-none rounded-2xl border-0 bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#b3b3b3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Diensten</Label>
                  <ServicesMultiSelect
                    options={serviceOptions}
                    selected={selectedServices}
                    onChange={(value) => setValue("services", value, { shouldValidate: true })}
                    placeholder="Selecteer diensten"
                    loading={loadingServices}
                    error={!!errors.services}
                  />
                  {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
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
                              onClick={() =>
                                setValue(
                                  "services",
                                  selectedServices.filter((value) => value !== id),
                                  { shouldValidate: true }
                                )
                              }
                              className="ml-0.5 rounded-full transition-colors hover:text-primary/70"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    Afbeeldingen <span className="text-red-500">*</span>
                  </Label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-[#ececec]">
                          <img src={preview.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d7d7d7] bg-white px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ececec] text-[#8d8d8d]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-sm text-[#b3b3b3]">Klik om afbeeldingen te uploaden (JPG, PNG, WebP)</span>
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

                  {uploadingImages && (
                    <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                      <Loader2 className="h-3 w-3 animate-spin" /> Afbeeldingen uploaden...
                    </p>
                  )}
                </div>

                {/* Video upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Video uploaden (optioneel)</Label>

                  {videoPreview ? (
                    <div className="group relative overflow-hidden rounded-2xl bg-black">
                      <video src={videoPreview} className="h-40 w-full object-cover opacity-80" muted />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-10 w-10 text-white/80" />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d7d7d7] bg-white px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ececec] text-[#8d8d8d]">
                        <Play className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-[#b3b3b3]">Klik om een video te uploaden (MP4, MOV, WebM)</span>
                    </button>
                  )}
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />

                  {uploadingVideo && (
                    <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                      <Loader2 className="h-3 w-3 animate-spin" /> Video uploaden...
                    </p>
                  )}
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">
                    <span className="flex items-center gap-1.5"><Link className="h-3.5 w-3.5" /> Video URL (optioneel)</span>
                  </Label>
                  <Input
                    placeholder="bijv. https://youtube.com/watch?v=..."
                    {...register("videoUrl")}
                    className="h-11 rounded-xl border-0 bg-white text-[#111111] shadow-none placeholder:text-[#b3b3b3]"
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <Switch id="proj-status" checked={status} onCheckedChange={(v) => setValue("status", v)} />
                  <Label className="text-sm font-semibold text-primary">Actief</Label>
                </div>

                {/* Upload progress label */}
                {uploadLabel && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadLabel}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={isLoading}
                    className="h-12 min-w-[104px] rounded-[1.05rem] border-primary bg-white px-8 text-primary hover:bg-primary/5"
                  >
                    Annuleren
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 min-w-[104px] rounded-[1.05rem] bg-primary px-8 text-white hover:bg-primary/90"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Opslaan"}
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
