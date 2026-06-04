import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.name
 * @param {string} props.placeholder
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} props.value
 * @param {Function} props.onValueChange
 * @param {string} [props.error]
 */
export default function SelectInput({
  label,
  name,
  placeholder = "Selecteer...",
  options = [],
  value,
  onValueChange,
  error,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-[var(--text-main)]">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="input-ui bg-primaryGradient/5 hover:bg-primaryGradient/10 transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
