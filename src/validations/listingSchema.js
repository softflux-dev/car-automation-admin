import { z } from "zod";

const CATEGORIES = ["Staalconstructies", "Trappen", "Hekwerken", "Overige"];

export const listingSchema = z.object({
  title: z
    .string()
    .min(1, "Titel is verplicht")
    .min(3, "Titel moet minimaal 3 tekens bevatten"),
  category: z
    .string()
    .min(1, "Categorie is verplicht")
    .refine((val) => CATEGORIES.includes(val), {
      message: "Ongeldige categorie",
    }),
  description: z
    .string()
    .min(1, "Beschrijving is verplicht")
    .min(10, "Beschrijving moet minimaal 10 tekens bevatten"),
  projectDetails: z
    .string()
    .min(1, "Projectdetails zijn verplicht")
    .min(5, "Projectdetails moeten minimaal 5 tekens bevatten"),
  images: z.array(z.any()).min(1, "Minimaal 1 afbeelding is verplicht"),
  videos: z.array(z.any()).optional().default([]),
  status: z.enum(["concept", "published"]).default("concept"),
  isFeatured: z.boolean().default(false),
});

export { CATEGORIES };
