import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import OtpInput from "@/components/inputs/OtpInput";
import { useAppDispatch } from "@/store/hooks";
import { verifyOtp, resendOtp } from "@/store/slices/authSlice";
import { toast } from "@/hooks/use-toast";
import { getApiMessage } from "@/lib/apiMessage";

const TIMER_SECONDS = 300; // 5 minutes

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(TIMER_SECONDS);

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending) return;
    try {
      setIsResending(true);
      const payload = await dispatch(resendOtp(email)).unwrap();
      toast({
        title: "Succes",
        description: getApiMessage(payload, "Verificatiecode opnieuw verzonden"),
      });
      setCountdown(TIMER_SECONDS);
      setError("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Opnieuw verzenden mislukt",
        description: getApiMessage(err, "Verificatiecode opnieuw verzenden mislukt"),
      });
    } finally {
      setIsResending(false);
    }
  }, [email, dispatch, countdown, isResending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Voer de 6-cijferige code in");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Code mag alleen cijfers bevatten");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const payload = await dispatch(verifyOtp({ email, otp: code })).unwrap();
      toast({
        title: "Succes",
        description: getApiMessage(payload, "Code succesvol geverifieerd"),
      });
      const resetToken = payload?.data?.resetToken ?? null;
      navigate("/reset-password", { state: { email, resetToken } });
    } catch (err) {
      setError(getApiMessage(err, "Ongeldige verificatiecode"));
      toast({
        variant: "destructive",
        title: "Verificatie mislukt",
        description: getApiMessage(err, "Ongeldige verificatiecode"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canResend = countdown === 0;

  return (
    <div className="w-full text-center">
      <Link
        to="/forgot-password"
        className="auth-link mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft size={15} />
        Terug
      </Link>

      <h1 className="auth-heading mb-2">Verifieer uw e-mail</h1>
      <p className="auth-subtitle mb-8">
        Voer de 6-cijferige code in die is verzonden naar{" "}
        <span className="font-semibold text-black">{email || "uw e-mail"}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpInput length={6} value={code} onChange={setCode} error={error} />

        <div className="space-y-2">
          {/* Timer ring */}
          <div className="flex flex-col items-center gap-1">
            {!canResend && (
              <div className="flex items-center justify-center gap-2">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="rgba(var(--border),1)"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="rgb(var(--primary))"
                      strokeWidth="2.5"
                      strokeDasharray="100"
                      strokeDashoffset={100 - (countdown / TIMER_SECONDS) * 100}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium tabular-nums" style={{ color: "rgb(var(--primary))" }}>
                  {formatTime(countdown)}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className={`auth-link text-sm ${!canResend || isResending ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {isResending ? "Verzenden…" : "Code opnieuw verzenden"}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-auth" disabled={isSubmitting}>
          {isSubmitting ? "Verifiëren…" : "Doorgaan"}
        </button>
      </form>
    </div>
  );
}
