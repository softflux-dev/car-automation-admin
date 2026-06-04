import { z } from "zod";

/**
 * Example generic form schema — extend per use case.
 */
export const formSchema = z.object({
  name: z.string().min(1, "Naam is verplicht"),
  email: z.string().min(1, "E-mail is verplicht").email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  message: z.string().optional(),
});
