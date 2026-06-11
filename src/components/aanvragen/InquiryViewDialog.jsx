import { X, Loader2 } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";

const fmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function InquiryViewDialog({
  open,
  onOpenChange,
  inquiry,
  loading = false,
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] rounded-[2rem] border border-border/60 bg-white p-6 shadow-card duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90vh] overflow-y-auto">
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary text-white p-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </DialogPrimitive.Close>

          <div className="mb-4 flex flex-col space-y-1">
            <h2 className="text-xl font-bold text-[var(--title)]">
              Aanvraagdetails
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Overzicht van de aanvraag
            </p>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : !inquiry ? null : (
            <div className="space-y-5">
              {/* Klantinformatie */}
              <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-[var(--title)]">
                    Klantinformatie
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Alle klantgegevens van deze aanvraag
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Naam" value={inquiry.name} />
                  <Field label="E-mail" value={inquiry.email} />
                  <Field label="Telefoon" value={inquiry.phone} />
                </div>
              </section>

              {/* Geselecteerde diensten */}
              {Array.isArray(inquiry.services) &&
                inquiry.services.length > 0 && (
                  <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-[var(--title)]">
                        Geselecteerde diensten
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Bekijk de diensten die de klant heeft gekozen
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {inquiry.services.map((svc) => (
                        <div
                          key={svc._id}
                          className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-[rgb(var(--input))] p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {svc.image?.url && (
                              <img
                                src={svc.image.url}
                                alt={svc.name}
                                className="h-10 w-10 rounded-2xl object-cover shrink-0"
                              />
                            )}
                            <span className="text-sm font-medium text-[var(--title)] truncate">
                              {svc.name}
                            </span>
                          </div>
                          <Badge
                            className={
                              svc.status === "active"
                                ? "border-0 bg-emerald-100 text-emerald-600 shrink-0"
                                : "border-0 bg-gray-200 text-gray-600 shrink-0"
                            }
                          >
                            {svc.status === "active" ? "Actief" : "Inactief"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {/* Geselecteerde pakketten */}
              {Array.isArray(inquiry.packages) &&
                inquiry.packages.length > 0 && (
                  <section className="rounded-xl border border-border/60 bg-white p-4 space-y-3 shadow-sm">
                    <h3 className="text-sm font-bold text-[var(--title)]">
                      Geselecteerde pakketten
                    </h3>
                    <div className="flex flex-col gap-2">
                      {inquiry.packages.map((pkg) => (
                        <div
                          key={pkg._id}
                          className="rounded-2xl bg-[rgb(var(--input))] px-3 py-2 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[var(--title)]">
                              {pkg.name}
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              €{pkg.price}
                            </span>
                          </div>
                          {pkg.highlightBadge?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {pkg.highlightBadge.map((b) => (
                                <Badge
                                  key={b}
                                  className="border-0 bg-blue-100 text-blue-600 text-[10px] px-2 py-0"
                                >
                                  {b}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {/* Bericht */}
              {inquiry.message && (
                <section className="rounded-xl border border-border/60 bg-white p-4 space-y-2 shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--title)]">
                    Bericht
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {inquiry.message}
                  </p>
                </section>
              )}

              {/* Inzendingsinformatie */}
              <section className="rounded-xl border border-border/60 bg-white p-4 space-y-2 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--title)]">
                  Inzendingsinformatie
                </h3>
                <Field
                  label="Ontvangen"
                  value={
                    inquiry.createdAt
                      ? fmt.format(new Date(inquiry.createdAt))
                      : "—"
                  }
                />
                <Field
                  label="Geboekt op"
                  value={
                    inquiry.bookedDate
                      ? new Intl.DateTimeFormat("nl-NL").format(new Date(inquiry.bookedDate))
                      : "—"
                  }
                />
                <Field
                  label="Geboekt om"
                  value={inquiry.bookedTime || "—"}
                />
              </section>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--title)]">
        {value || "—"}
      </span>
    </div>
  );
}
