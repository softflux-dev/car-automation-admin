import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/inputs/PasswordInput";
import SuccessModal from "@/components/shared/SuccessModal";
import { useFormSchema } from "@/validations/useFormSchema";
import { resetPasswordSchema } from "@/validations/authSchemas";
import { useAppDispatch } from "@/store/hooks";
import { resetPassword } from "@/store/slices/authSlice";
import { toast } from "@/hooks/use-toast";
import { getApiMessage } from "@/lib/apiMessage";

export default function ResetPassword() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDescription, setSuccessDescription] = useState(
    "Uw wachtwoord is succesvol gewijzigd. U kunt nu inloggen met uw nieuwe wachtwoord.",
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const email = location.state?.email ?? "";
  const resetToken = location.state?.resetToken ?? "";

  useEffect(() => {
    if (!resetToken || !email) {
      navigate("/verify-code", { replace: true });
    }
  }, [resetToken, email, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormSchema(resetPasswordSchema, { password: "", confirmPassword: "" });

  const onSubmit = async (data) => {
    try {
      const payload = await dispatch(
        resetPassword({
          resetToken,
          newPassword: data.password,
          confirmPassword: data.confirmPassword,
        }),
      ).unwrap();

      const message = getApiMessage(payload, "Wachtwoord succesvol gewijzigd");
      toast({
        title: "Succes",
        description: message,
      });
      setSuccessDescription(message);
      setShowSuccess(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Opnieuw instellen mislukt",
        description: getApiMessage(error, "Failed to reset password"),
      });
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="w-full">
      <Link
        to="/verify-code"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-auth-link)] transition-opacity hover:opacity-80"
      >
        <ArrowLeft size={16} />
        Terug
      </Link>

      <h1 className="auth-heading mb-2">Wachtwoord opnieuw instellen</h1>
      <p className="auth-subtitle mb-8">
        Stel een nieuw wachtwoord in om door te gaan.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PasswordInput
          label="Nieuw wachtwoord"
          name="password"
          placeholder="Voer Nieuw wachtwoord in"
          register={register}
          error={errors.password?.message}
        />

        <PasswordInput
          label="Voer het wachtwoord opnieuw in"
          name="confirmPassword"
          placeholder="Voer uw wachtwoord opnieuw in"
          register={register}
          error={errors.confirmPassword?.message}
        />

        <button type="submit" className="btn-auth" disabled={isSubmitting}>
          {isSubmitting ? "Laden..." : "Wachtwoord opnieuw instellen"}
        </button>
      </form>

      {/* Success modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message={successDescription}
      />
    </div>
  );
}
