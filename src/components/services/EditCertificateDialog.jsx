import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, CalendarIcon } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TextareaInput from "@/components/inputs/TextareaInput";
import FileUpload from "@/components/shared/FileUpload";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AddCertificateDialog({ open, onOpenChange, certificate, onSubmit }) {
  const [imageFiles, setImageFiles] = useState([]);
  const [date, setDate] = useState(null);

  const defaultValues = {
    name: "",
    description: "",
    date: "",
    status: true,
    image: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const status = watch("status");

  useEffect(() => {
    if (certificate) {
      const certDate = certificate.date ? new Date(certificate.date.split('/').reverse().join('-')) : null;
      reset({
        name: certificate.name || "",
        description: certificate.description || "",
        date: certificate.date || "",
        status: certificate.status === "active",
        image: certificate.image || "",
      });
      setDate(certDate);
      setImageFiles(certificate.image ? [certificate.image] : []);
    } else {
      reset(defaultValues);
      setDate(null);
      setImageFiles([]);
    }
  }, [certificate, reset, open]);

  const handleClose = (isOpen) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      reset();
      setImageFiles([]);
      setDate(null);
    }
  };

  const handleFormSubmit = (data) => {
    const formattedDate = date ? format(date, "dd/MM/yyyy") : "";
    const formData = {
      ...data,
      date: formattedDate,
      image: imageFiles[0] || "",
      status: data.status ? "active" : "inactive",
    };
    onSubmit(formData);
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
              {certificate ? "Certificaat bewerken" : "Nieuw certificaat toevoegen"}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {certificate ? "Wijzig de certificaatgegevens" : "Voeg een nieuw certificaat toe"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 py-2">
            {/* Certificaatnaam */}
            <div className="space-y-2">
              <Label htmlFor="name">Certificaatnaam</Label>
              <Input
                id="name"
                placeholder="Voer certificaatnaam in"
                {...register("name", { required: "Certificaatnaam is verplicht" })}
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
                placeholder="Voer certificaatbeschrijving in..."
                register={register}
                rows={4}
              />
            </div>

            {/* Datum */}
            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !date && "text-[var(--text-muted)]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Ontvangen datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      if (selectedDate) {
                        setValue("date", format(selectedDate, "dd/MM/yyyy"));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Certificaatafbeelding */}
            <div className="space-y-2">
              <Label>Certificaatafbeelding</Label>
              <FileUpload
                accept="image/*"
                label="Certificaatafbeelding"
                onFileSelect={(file) => setImageFiles([file])}
              />
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
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
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
