import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2, Upload, Trash2 } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TextareaInput from "@/components/inputs/TextareaInput";
import { Switch } from "@/components/ui/switch";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

const defaultValues = { name: "", description: "", status: true, image: "" };

export default function AddServiceDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
  submitting = false,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  const status = watch("status");
  const isLoading = uploading || submitting;

  useEffect(() => {
    if (service) {
      reset({
        name: service.name || "",
        description: service.description || "",
        status: service.status === "active",
        image: service.image?.url ? "selected" : "",
      });
      const previewUrl = service.image?.url || null;
      setImageFile(null);
      setImagePreview(previewUrl);
      setValue("image", previewUrl ? "selected" : "");
    } else {
      reset(defaultValues);
      setImageFile(null);
      setImagePreview(null);
      setValue("image", "");
    }
  }, [service, reset, open, setValue]);

  const handleClose = (isOpen) => {
    if (isLoading) return;
    onOpenChange(isOpen);
    if (!isOpen) {
      reset(defaultValues);
      setImageFile(null);
      setImagePreview(null);
      setValue("image", "");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setValue("image", "selected");
    e.target.value = "";
  };

  const handleFormSubmit = async (data) => {
    let imageUrl = service?.image?.url || "";

    if (imageFile) {
      setUploading(true);
      try {
        const uploaded = await uploadToCloudinary(imageFile);
        imageUrl = uploaded.url;
      } catch {
        setUploading(false);
        setError("image", {
          type: "manual",
          message: "Afbeelding uploaden mislukt.",
        });
        return;
      }
      setUploading(false);
    }

    if (!imageUrl) {
      setError("image", {
        type: "required",
        message: "Afbeelding is verplicht.",
      });
      return;
    }

    onSubmit({
      name: data.name,
      description: data.description,
      image: { url: imageUrl },
      status: data.status ? "active" : "inactive",
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[680px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[var(--radius)] bg-white p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Close
            disabled={isLoading}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white opacity-90 transition-opacity hover:opacity-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="px-6 pb-4 pt-6 pr-16">
            <h2 className="text-[1.8rem] font-bold text-title">
              {service ? "Dienst bewerken" : "Nieuwe dienst toevoegen"}
            </h2>
          </div>

          {/* Scrollable body */}
          <div className="max-h-[75vh] overflow-y-auto px-6 pb-6">
            <div className="rounded-[var(--radius)] bg-muted p-5">
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-title">
                    Dienstnaam
                  </Label>
                  <Input
                    id="svc-name"
                    placeholder="Voer dienstnaam in"
                    {...register("name", {
                      required: "Dienstnaam is verplicht",
                    })}
                    className={`h-11 rounded-xl border border-border bg-white text-title placeholder:text-subtitle ${errors.name ? "ring-2 ring-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-title">
                    Beschrijving
                  </Label>
                  <TextareaInput
                    id="svc-description"
                    name="description"
                    placeholder="Voer servicebeschrijving in..."
                    register={register}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-title placeholder:text-subtitle"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-title">
                    Uitgelichte afbeelding
                  </Label>
                  {imagePreview ? (
                    <div className="group relative overflow-hidden rounded-2xl bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setValue("image", "");
                        }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-subtitle">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-subtitle">
                        Klik om een afbeelding te uploaden
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <input
                    type="hidden"
                    {...register("image", {
                      validate: () =>
                        imagePreview ? true : "Afbeelding is verplicht",
                    })}
                    value={imagePreview ? "selected" : ""}
                  />
                  {errors.image && (
                    <p className="text-xs text-red-500">
                      {errors.image.message}
                    </p>
                  )}
                  {uploading && (
                    <p className="flex items-center gap-1.5 text-xs text-subtitle">
                      <Loader2 className="h-3 w-3 animate-spin" /> Afbeelding
                      uploaden...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="svc-status"
                    checked={status}
                    onCheckedChange={(checked) => setValue("status", checked)}
                  />
                  <Label className="text-sm font-semibold text-primary">
                    Actief
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={isLoading}
                    className="h-12 min-w-[104px] rounded-[var(--radius-xs)] border-primary bg-white px-8 text-primary hover:bg-primary/5"
                  >
                    Annuleren
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 min-w-[104px] rounded-[var(--radius-xs)] bg-primary px-8 text-white hover:bg-primary/90"
                  >
                    {isLoading ? (
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
