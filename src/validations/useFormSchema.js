import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Custom hook wrapping react-hook-form with Zod validation.
 * @param {import("zod").ZodSchema} schema - Zod schema for validation
 * @param {Object} [defaultValues] - Default form values
 * @returns {import("react-hook-form").UseFormReturn}
 */
export function useFormSchema(schema, defaultValues = {}) {
  return useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
