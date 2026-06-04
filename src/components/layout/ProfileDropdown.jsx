import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import { persistor } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TOKEN_KEY, REFRESH_KEY } from "@/api/axios";

export default function ProfileDropdown({ onLogoutClick }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const displayName = user?.name ?? "Admin";
  const displayEmail = user?.email ?? "";
  const avatarUrl = user?.image ?? "";
  const initials =
    displayName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    dispatch(clearAuth());
    persistor.purge();
    navigate("/login", { replace: true });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--brand-50)] cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown size={15} className="text-[var(--text-muted)]" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[280px] p-0 overflow-hidden rounded-2xl shadow-xl bg-white"
      >
        {/* Profile header */}
        <div className="flex flex-col items-center gap-3 px-4 py-6 bg-gradient-to-b from-[var(--secondary)] to-white">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-bold text-lg text-[var(--title)]">
              {displayName}
            </h3>
            {displayEmail && (
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {displayEmail}
              </p>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center justify-start gap-2 w-full px-4 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            <Settings size={18} />
            Instellingen
          </button>

          <button
            onClick={onLogoutClick ?? handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-destructive font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Uitloggen
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
