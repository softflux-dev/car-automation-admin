import { z } from "zod";
import { strongPassword } from "./passwordValidator";

export const profileSchema = z.object({
  username: z.string().min(1, "Naam is verplicht"),
  email: z
    .string()
    .min(1, "E-mailadres is verplicht")
    .email("Ongeldig e-mailadres"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Huidig wachtwoord is verplicht"),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, "Bevestig uw wachtwoord"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });
