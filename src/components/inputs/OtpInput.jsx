import { useRef, useState } from "react";

export default function OtpInput({ length = 6, value = "", onChange, error }) {
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(
    value.split("").concat(Array(length).fill("")).slice(0, length)
  );

  const handleChange = (idx, val) => {
    if (val && !/^\d$/.test(val)) return;

    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    onChange?.(next.join(""));

    // Auto-focus next
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = pasted.split("").concat(Array(length).fill("")).slice(0, length);
    setDigits(next);
    onChange?.(next.join(""));

    const focusIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`otp-box ${error ? "border-2 border-red-400" : ""}`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
