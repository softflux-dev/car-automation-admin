import { z } from "zod";
import { strongPassword } from "./passwordValidator";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mailadres is verplicht")
    .email("Ongeldig e-mailadres"),
  password: strongPassword,
});
