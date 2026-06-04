import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import NotificationPanel from "./NotificationPanel";
import LogoutDialog from "./LogoutDialog";
import SuccessModal from "@/components/shared/SuccessModal";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import { persistor } from "@/store";
import { TOKEN_KEY, REFRESH_KEY } from "@/api/axios";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/services": "Diensten",
  "/packages": "Pakketten",
  "/inquiries": "Aanvragen",
  "/portfolio": "Portfolio",
  "/settings": "Profiel & intelligentie",
  "/intelligence": "Intelligentie",
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSuccessOpen, setLogoutSuccessOpen] = useState(false);
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    setLogoutSuccessOpen(true);
  };

  const handleLogoutSuccessClose = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    dispatch(clearAuth());
    persistor.purge();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full items-center justify-between">
      {/* Logout Success Modal */}
      <SuccessModal
        isOpen={logoutSuccessOpen}
        onClose={handleLogoutSuccessClose}
        message="U bent succesvol uitgelogd."
      />

      {/* Mobile Menu Trigger & Title */}
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100">
            <Menu className="h-6 w-6 text-gray-700" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold text-gray-700 hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        <NotificationPanel />

        <ProfileDropdown onLogoutClick={() => setLogoutOpen(true)} />
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
