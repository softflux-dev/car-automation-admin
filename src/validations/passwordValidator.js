import { z } from "zod";

/**
 * Reusable strong password field — use this wherever a password is set or reset.
 * Rules: min 8 chars · uppercase · lowercase · digit · special character
 */
export const strongPassword = z
  .string()
  .min(1, "Wachtwoord is verplicht")
  .min(6, "Wachtwoord moet minimaal 6 tekens bevatten")
  .regex(/[A-Z]/, "Wachtwoord moet minimaal één hoofdletter bevatten")
  .regex(/[a-z]/, "Wachtwoord moet minimaal één kleine letter bevatten")
  .regex(/[0-9]/, "Wachtwoord moet minimaal één cijfer bevatten")
  .regex(
    /[^A-Za-z0-9]/,
    "Wachtwoord moet minimaal één speciaal teken bevatten (!@#$%…)"
  );
