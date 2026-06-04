import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label,
  name,
  placeholder = "Voer uw wachtwoord in",
  error,
  register,
  labelClass = "auth-label",
  inputClass = "auth-input",
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className={labelClass}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className={`${inputClass} w-full pr-10 ${error ? "border-red-400" : ""}`}
          {...(register ? register(name) : { name })}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
        >
          {visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
