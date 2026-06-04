import { useEffect, useRef, useState } from "react";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  toggleNotificationsStart,
  toggleNotificationsSuccess,
  toggleNotificationsFailure,
} from "@/store/slices/settingsSlice";
import {
  getAdminSettings,
  updateProfile,
  changePassword,
  toggleEmailNotifications,
} from "@/api/services/settingsService";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";

export default function InstellingenPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const user = useAppSelector((s) => s.auth.user);
  const { emailNotification, loading } = useAppSelector((s) => s.settings);

  const avatarInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ── Profile form ──
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({ defaultValues: { name: "", email: "" } });

  // ── Password form ──
  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPw,
    watch: watchPw,
    formState: { errors: pwErrors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // ── Fetch settings on mount ──
  useEffect(() => {
    dispatch(fetchSettingsStart());
    getAdminSettings()
      .then((res) => {
        // Response: { data: { _id, name, email, image, emailNotification, ... } }
        const admin = res.data.data ?? res.data;
        dispatch(
          fetchSettingsSuccess({
            emailNotification: admin.emailNotification ?? false,
          }),
        );
        resetProfile({
          name: admin.name ?? user?.name ?? "",
          email: admin.email ?? user?.email ?? "",
        });
        // Seed Redux user with latest server values (image may have changed)
        dispatch(
          updateUser({
            name: admin.name,
            email: admin.email,
            image: admin.image ?? null,
          }),
        );
      })
      .catch(() => {
        dispatch(fetchSettingsFailure());
        resetProfile({
          name: user?.name ?? "",
          email: user?.email ?? "",
        });
      });
  }, []);

  // ── Avatar select ──
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  // ── Save profile ──
  const onSaveProfile = async (data) => {
    dispatch(updateProfileStart());
    try {
      let avatarUrl = user?.image ?? user?.image ?? null;

      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const result = await uploadToCloudinary(avatarFile);
          avatarUrl = result.url;
        } catch (err) {
          toast({
            title: err.message || "Avatar uploaden mislukt.",
            variant: "destructive",
          });
          setUploadingAvatar(false);
          dispatch(updateProfileFailure());
          return;
        }
        setUploadingAvatar(false);
        setAvatarFile(null);
      }

      const payload = {
        name: data.name,
        email: data.email,
        ...(avatarUrl ? { image: avatarUrl } : {}),
      };

      const res = await updateProfile(payload);
      // Response: { data: { _id, name, email, image, ... } }
      const updated = res.data.data ?? {};
      dispatch(updateProfileSuccess());
      dispatch(
        updateUser({
          name: updated.name ?? data.name,
          email: updated.email ?? data.email,
          image: updated.image ?? avatarUrl,
        }),
      );
      toast({ title: res.data.message || "Profiel bijgewerkt." });
    } catch (err) {
      dispatch(updateProfileFailure());
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  // ── Change password ──
  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Wachtwoorden komen niet overeen.",
        variant: "destructive",
      });
      return;
    }
    dispatch(changePasswordStart());
    try {
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      dispatch(changePasswordSuccess());
      toast({ title: res.data.message || "Wachtwoord gewijzigd." });
      resetPw();
    } catch (err) {
      dispatch(changePasswordFailure());
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  // ── Toggle notifications ──
  const handleToggleNotifications = async (checked) => {
    dispatch(toggleNotificationsStart());
    try {
      const res = await toggleEmailNotifications({
        emailNotification: checked,
      });
      dispatch(toggleNotificationsSuccess(checked));
      toast({ title: res.data.message || "Meldingsinstellingen opgeslagen." });
    } catch (err) {
      dispatch(toggleNotificationsFailure());
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  const avatarSrc = avatarPreview ?? user?.image ?? "";
  const initials =
    (user?.name ?? "A")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  const isProfileLoading = loading.profile || uploadingAvatar;

  return (
    <div className="space-y-8 w-full">
      {/* ── Section 1: Persoonlijke gegevens ── */}
      <section>
        <h1 className="text-xl font-semibold text-[var(--title)] mb-4">
          Persoonlijke gegevens
        </h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
          <h2 className="text-lg font-bold text-[var(--title)] mb-5">
            Beheerdersprofiel
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="h-[72px] w-[72px]">
                <AvatarImage
                  src={avatarSrc}
                  alt="Profiel"
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isProfileLoading}
                className="absolute bottom-0 right-0 h-6 w-6 bg-[var(--title)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--title)]/80 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white bg-black rounded-full" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--title)]">
                Upload een nieuwe avatar
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                JPG, PNG of WebP (max. 10MB)
              </p>
              {avatarFile && (
                <p className="text-xs text-primary mt-0.5 font-medium">
                  {avatarFile.name} geselecteerd
                </p>
              )}
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[var(--title)]">
                  Voornaam
                </Label>
                <Input
                  placeholder="Voer uw voornaam in"
                  {...regProfile("name", { required: "Voornaam is verplicht" })}
                  className={profileErrors.name ? "ring-2 ring-red-500" : ""}
                />
                {profileErrors.name && (
                  <p className="text-xs text-red-500">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[var(--title)]">
                E-mail
              </Label>
              <Input
                type="email"
                placeholder="Voer uw e-mail in"
                {...regProfile("email", { required: "E-mail is verplicht" })}
                className={profileErrors.email ? "ring-2 ring-red-500" : ""}
              />
              {profileErrors.email && (
                <p className="text-xs text-red-500">
                  {profileErrors.email.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isProfileLoading}
                className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 min-w-[160px]"
              >
                {isProfileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Opslaan...
                  </>
                ) : (
                  "Opslaan & bijwerken"
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Section 2: Wachtwoord ── */}
      <section>
        <h1 className="text-xl font-semibold text-[var(--title)] mb-4">
          Beveiligingsgegevens
        </h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
          <h2 className="text-lg font-bold text-[var(--title)] mb-5">
            Wachtwoord wijzigen
          </h2>

          <form onSubmit={handlePw(onChangePassword)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[var(--title)]">
                  Huidig wachtwoord
                </Label>
                <div className="relative">
                  <Input
                    type={showPw.current ? "text" : "password"}
                    placeholder="Voer uw huidige wachtwoord in"
                    {...regPw("currentPassword", {
                      required: "Huidig wachtwoord is verplicht",
                    })}
                    className={`pr-10 ${pwErrors.currentPassword ? "ring-2 ring-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, current: !p.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--title)]"
                  >
                    {showPw.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {pwErrors.currentPassword && (
                  <p className="text-xs text-red-500">
                    {pwErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[var(--title)]">
                  Nieuw wachtwoord
                </Label>
                <div className="relative">
                  <Input
                    type={showPw.new ? "text" : "password"}
                    placeholder="Voer uw nieuwe wachtwoord in"
                    {...regPw("newPassword", {
                      required: "Nieuw wachtwoord is verplicht",
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/,
                        message:
                          "Wachtwoord moet minimaal 8 tekens bevatten, een hoofdletter, een kleine letter, een cijfer en een speciaal teken.",
                      },
                    })}
                    className={`pr-10 ${pwErrors.newPassword ? "ring-2 ring-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--title)]"
                  >
                    {showPw.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {pwErrors.newPassword && (
                  <p className="text-xs text-red-500">
                    {pwErrors.newPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[var(--title)]">
                Nieuw wachtwoord bevestigen
              </Label>
              <div className="relative">
                <Input
                  type={showPw.confirm ? "text" : "password"}
                  placeholder="Bevestig uw nieuwe wachtwoord"
                  {...regPw("confirmPassword", {
                    required: "Bevestig uw wachtwoord",
                    validate: (v) =>
                      v === watchPw("newPassword") ||
                      "Wachtwoorden komen niet overeen",
                  })}
                  className={`pr-10 ${pwErrors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--title)]"
                >
                  {showPw.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {pwErrors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {pwErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={loading.password}
                className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 min-w-[160px]"
              >
                {loading.password ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Opslaan...
                  </>
                ) : (
                  "Opslaan & bijwerken"
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Section 3: Meldingen ── */}
      <section>
        <h1 className="text-xl font-semibold text-[var(--title)] mb-4">
          Meldingsinstellingen
        </h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--title)]">
                E-mailmeldingen voor nieuwe aanvragen
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Indien ingeschakeld, ontvangt u een e-mail elke keer dat een
                nieuwe aanvraag wordt ingediend.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {loading.notifications && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              <Switch
                checked={emailNotification}
                onCheckedChange={handleToggleNotifications}
                disabled={loading.notifications}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
