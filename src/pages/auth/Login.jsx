import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "@/components/inputs/PasswordInput";
import { useFormSchema } from "@/validations/useFormSchema";
import { loginSchema } from "@/validations/loginSchema";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
import { toast } from "@/hooks/use-toast";
import { getApiMessage } from "@/lib/apiMessage";
import {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
} from "@/store/slices/notificationsSlice";
import { fetchNotifications } from "@/api/services/notificationsService";

import {
  fetchSettingsFailure,
  fetchSettingsStart,
  fetchSettingsSuccess,
} from "@/store/slices/settingsSlice";
import { updateUser } from "@/store/slices/authSlice";
import { getAdminSettings } from "@/api/services/settingsService";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormSchema(loginSchema, { email: "", password: "" });

  const onSubmit = async (data) => {
    try {
      const payload = await dispatch(login(data)).unwrap();
      toast({
        title: "Success",
        description: getApiMessage(payload, "Logged in successfully"),
      });
      // Pre-fetch notifications after login so the bell is ready also the settings for profile and dropdown
      dispatch(fetchNotificationsStart());
      fetchNotifications()
        .then((res) => {
          const list =
            res.data.data?.notifications ?? res.data.data ?? res.data ?? [];
          dispatch(fetchNotificationsSuccess(Array.isArray(list) ? list : []));
        })
        .catch(() => dispatch(fetchNotificationsFailure()));
      dispatch(fetchSettingsStart());
      getAdminSettings()
        .then((res) => {
          const userData = res?.data?.data;
          dispatch(fetchSettingsSuccess(userData));
          // Seed auth user with latest server values so Header/Profile update immediately
          dispatch(
            updateUser({
              name: userData?.name,
              email: userData?.email,
              image: userData?.image ?? null,
            }),
          );
          console.log({ userData });
        })
        .catch(() => dispatch(fetchSettingsFailure()));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: getApiMessage(error, "Ongeldige inloggegevens"),
      });
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <h1 className="auth-heading mb-2">Beheerder aanmelden</h1>
      <p className="auth-subtitle mb-8">
        Voer uw inloggegevens in om toegang te krijgen tot het
        beheerdersdashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="auth-label">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            placeholder="Voer uw e-mailadres in"
            className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
            {...register("email")}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          label="Wachtwoord"
          name="password"
          placeholder="Voer uw wachtwoord in"
          register={register}
          error={errors.password?.message}
        />

        {/* Forgot password — right-aligned */}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="auth-link text-sm">
            Wachtwoord vergeten?
          </Link>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-auth" disabled={isSubmitting}>
          {isSubmitting ? "Aanmelden…" : "Inloggen"}
        </button>
      </form>
    </div>
  );
}
