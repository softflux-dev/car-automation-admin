import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TextareaInput from "@/components/inputs/TextareaInput";
import FileUpload from "@/components/shared/FileUpload";
import { Switch } from "@/components/ui/switch";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

export default function AddServiceDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const defaultValues = {
    name: "",
    description: "",
    status: true,
    image: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const status = watch("status");

  useEffect(() => {
    if (service) {
      const previewUrl = service.image?.url || null;
      reset({
        name: service.name || "",
        description: service.description || "",
        status: service.status === "active",
        image: previewUrl ? "selected" : "",
      });
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
    onOpenChange(isOpen);
    if (!isOpen) {
      reset(defaultValues);
      setImageFile(null);
      setImagePreview(null);
      setValue("image", "");
    }
  };

  const handleFormSubmit = async (data) => {
    let imageUrl = service?.image?.url || "";

    if (imageFile) {
      try {
        const uploaded = await uploadToCloudinary(imageFile);
        imageUrl = uploaded.url;
      } catch {
        setError("image", {
          type: "manual",
          message: "Afbeelding uploaden mislukt.",
        });
        return;
      }
    }

    if (!imageUrl) {
      setError("image", {
        type: "required",
        message: "Afbeelding is verplicht.",
      });
      return;
    }

    onSubmit({
      ...data,
      image: { url: imageUrl },
      status: data.status ? "active" : "inactive",
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-3xl max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary text-white p-2 shadow-soft hover:shadow-md">
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-xl font-bold text-[var(--title)]">
              {service ? "Dienst bewerken" : "Nieuwe dienst toevoegen"}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {service
                ? "Wijzig de dienstgegevens"
                : "Voeg een nieuwe dienst toe aan uw aanbod"}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-5 py-2"
          >
            {/* Dienstnaam */}
            <div className="space-y-2">
              <Label htmlFor="name">Dienstnaam</Label>
              <Input
                id="name"
                placeholder="Voer dienstnaam in"
                {...register("name", { required: "Dienstnaam is verplicht" })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Beschrijving */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <TextareaInput
                id="description"
                name="description"
                placeholder="Voer servicebeschrijving in..."
                register={register}
                rows={4}
              />
            </div>

            {/* Uitgelichte afbeelding */}
            <div className="space-y-2">
              <Label>Uitgelichte afbeelding</Label>
              {imagePreview ? (
                <div className="group relative overflow-hidden rounded-2xl bg-[#ececec]">
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
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <FileUpload
                  accept="image/*"
                  label="Uitgelichte afbeelding"
                  onFileSelect={(file) => {
                    if (!file) return;
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setValue("image", "selected");
                  }}
                />
              )}
              <input
                type="hidden"
                {...register("image", {
                  validate: () =>
                    imagePreview ? true : "Afbeelding is verplicht",
                })}
                value={imagePreview ? "selected" : ""}
              />
              {errors.image && (
                <p className="text-xs text-red-500">{errors.image.message}</p>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="status">Actief</Label>
              <Switch
                id="status"
                checked={status}
                onCheckedChange={(checked) => setValue("status", checked)}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Annuleren
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Opslaan
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
