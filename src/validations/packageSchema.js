import { z } from "zod";

export const PACKAGE_TYPES = [
  { value: "loose", label: "Losse" },
  { value: "combo", label: "Combi" },
];

export const packageSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 tekens bevatten"),
  services: z.array(z.string()).min(1, "Selecteer minimaal één dienst"),
  price: z.string().optional(),
  duration: z
    .string()
    .refine((val) => val !== "" && Number(val) > 0, {
      message: "Duur moet groter zijn dan 0",
    }),
  features: z.array(z.string()).min(1, "Voeg minimaal 1 kenmerk toe"),
  highlightBadge: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  packageType: z.enum(["loose", "combo"]).default("loose"),
});

export const packageDefaultValues = {
  name: "",
  services: [],
  price: "",
  duration: "",
  features: [],
  highlightBadge: [],
  isActive: true,
  packageType: "loose",
};
