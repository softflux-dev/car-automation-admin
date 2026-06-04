import { z } from "zod";
import { strongPassword } from "./passwordValidator";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mailadres is verplicht")
    .email("Ongeldig e-mailadres"),
});

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Voer een zescijferige code in")
    .regex(/^\d{6}$/, "Code mag alleen cijfers bevatten"),
});

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Bevestig uw wachtwoord"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });
