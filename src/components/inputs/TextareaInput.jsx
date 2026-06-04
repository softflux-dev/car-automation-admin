import { Label } from "@/components/ui/label";

export default function TextareaInput({
  label,
  name,
  placeholder,
  error,
  register,
  rows = 4,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-[var(--text-main)]">
          {label}
        </Label>
      )}
      <textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        className="input-ui w-full resize-none text-sm"
        {...(register ? register(name) : { name })}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
