import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFormSchema } from "@/validations/useFormSchema";
import { forgotPasswordSchema } from "@/validations/authSchemas";
import { useAppDispatch } from "@/store/hooks";
import { forgotPassword } from "@/store/slices/authSlice";
import { toast } from "@/hooks/use-toast";
import { getApiMessage } from "@/lib/apiMessage";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormSchema(forgotPasswordSchema, { email: "" });

  const onSubmit = async (data) => {
    try {
      const payload = await dispatch(forgotPassword(data.email)).unwrap();
      toast({
        title: "Success",
        description: getApiMessage(payload, "Verification code sent"),
      });
      navigate("/verify-code", { state: { email: data.email } });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: getApiMessage(error, "Failed to send verification code"),
      });
    }
  };

  return (
    <div className="w-full">
      {/* Back link */}
      <Link
        to="/login"
        className="auth-link mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft size={15} />
        Back to Login
      </Link>

      {/* Heading */}
      <h1 className="auth-heading mt-4 mb-2">Forgot Password</h1>
      <p className="auth-subtitle mb-8">
        Enter your registered email address and we'll send you a reset code.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="auth-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <button type="submit" className="btn-auth" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send Code"}
        </button>
      </form>
    </div>
  );
}
