import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TextInput({
  label,
  name,
  type = "text",
  placeholder,
  error,
  register,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label
          htmlFor={name}
          className="text-sm font-bold text-[var(--text-main)]"
        >
          {label}
        </Label>
      )}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className="input-ui"
        {...(register ? register(name) : { name })}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
