import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, CalendarIcon, Loader2, Upload, Trash2 } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TextareaInput from "@/components/inputs/TextareaInput";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { Input } from "../ui/input";

const defaultValues = { name: "", description: "", status: true };

export default function AddCertificateDialog({
  open,
  onOpenChange,
  certificate,
  onSubmit,
  submitting = false,
}) {
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [date, setDate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const status = watch("status");
  const isLoading = uploading || submitting;

  useEffect(() => {
    if (certificate) {
      const certDate = certificate.receivedDate
        ? new Date(certificate.receivedDate)
        : certificate.date
        ? new Date(certificate.date.split("/").reverse().join("-"))
        : null;
      reset({
        name: certificate.name || "",
        description: certificate.description || "",
        status: certificate.status === "active",
      });
      setDate(certDate);
      setImageFiles([]);
      setImagePreviews(certificate.images?.map((i) => ({ url: i.url, existing: true })) ?? []);
    } else {
      reset(defaultValues);
      setDate(null);
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [certificate, reset, open]);

  const handleClose = (isOpen) => {
    if (isLoading) return;
    onOpenChange(isOpen);
    if (!isOpen) {
      reset(defaultValues);
      setDate(null);
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => ({ url: URL.createObjectURL(f), existing: false }))]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const existingCount = imagePreviews.filter((p) => p.existing).length;
    const fileIndex = index - existingCount;
    if (fileIndex >= 0) setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    // Upload all selected images to Cloudinary
    let uploadedImages = certificate?.images ?? [];

    if (imageFiles.length > 0) {
      setUploading(true);
      try {
        const results = await Promise.all(imageFiles.map((f) => uploadToCloudinary(f)));
        const existingKept = (certificate?.images ?? []).filter((img) =>
          imagePreviews.some((p) => p.existing && p.url === img.url)
        );
        uploadedImages = [...existingKept, ...results.map((r) => ({ url: r.url }))];
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    } else {
      // Only keep images that are still in previews
      uploadedImages = (certificate?.images ?? []).filter((img) =>
        imagePreviews.some((p) => p.existing && p.url === img.url)
      );
    }

    onSubmit({
      name: data.name,
      description: data.description,
      receivedDate: date ? format(date, "yyyy-MM-dd") : "",
      status: data.status ? "active" : "inactive",
      images: uploadedImages,
    });
  };

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

          {/* Header */}
          <div className="px-6 pb-4 pt-6 pr-16">
            <h2 className="text-[1.8rem] font-bold text-[#111111]">
              {certificate ? "Certificaat bewerken" : "Nieuw certificaat toevoegen"}
            </h2>
          </div>

          {/* Scrollable body */}
          <div className="max-h-[75vh] overflow-y-auto px-6 pb-6">
            <div className="rounded-[1.9rem] bg-[#f5f5f5] p-5">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Certificaatnaam</Label>
                  <Input
                    id="cert-name"
                    placeholder="Voer certificaatnaam in"
                    {...register("name", { required: "Certificaatnaam is verplicht" })}
                    className={`h-11 rounded-xl border-0 bg-white text-[#111111] shadow-none placeholder:text-[#b3b3b3] ${errors.name ? "ring-2 ring-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Beschrijving</Label>
                  <TextareaInput
                    id="cert-description"
                    name="description"
                    placeholder="Voer certificaatbeschrijving in..."
                    register={register}
                    rows={4}
                    className="w-full resize-none rounded-2xl border-0 bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#b3b3b3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Ontvangstdatum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start rounded-xl border-0 bg-white text-left font-normal shadow-none",
                          !date && "text-[#b3b3b3]"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : "Selecteer ontvangstdatum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={(d) => setDate(d)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#111111]">Afbeeldingen</Label>

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
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d7d7d7] bg-white px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ececec] text-[#8d8d8d]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-sm text-[#b3b3b3]">Klik om afbeeldingen te uploaden</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

                  {uploading && (
                    <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                      <Loader2 className="h-3 w-3 animate-spin" /> Afbeeldingen uploaden...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="cert-status"
                    checked={status}
                    onCheckedChange={(checked) => setValue("status", checked)}
                  />
                  <Label className="text-sm font-semibold text-primary">Actief</Label>
                </div>

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
