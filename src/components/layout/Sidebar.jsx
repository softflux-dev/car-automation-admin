import { Link, useLocation, useNavigate } from "react-router-dom";
import brandLogo from "@/assets/icons/brandLogo.svg";
import dashboardIcon from "@/assets/icons/dashbaord.svg";
import servicesIcon from "@/assets/icons/services.svg";
import packagesIcon from "@/assets/icons/packages.svg";
import inquiriesIcon from "@/assets/icons/inquiries.svg";
import portfolioIcon from "@/assets/icons/portfolio.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import calendarIcon from "@/assets/icons/calendar.svg";
 
import { cn } from "@/lib/utils";
 
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: dashboardIcon },
  { name: "Diensten", href: "/services", icon: servicesIcon },
  { name: "Pakketten", href: "/packages", icon: packagesIcon },
  { name: "Aanvragen", href: "/inquiries", icon: inquiriesIcon },
  { name: "Kalender", href: "/calendar", icon: calendarIcon },
  { name: "Portfolio", href: "/portfolio", icon: portfolioIcon },
  { name: "Instellingen", href: "/settings", icon: settingsIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[72px] px-6 items-center justify-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-[var(--radius-sm)]"
          aria-label="Naar dashboard"
        >
          <img src={brandLogo} alt="Brand logo" className="h-10 lg:h-10" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all",
                isActive
                  ? "bg-primary text-white rounded-lg"
                  : "text-subtitle hover:bg-muted hover:text-black rounded-lg transition-colors"
              )}
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className={cn(
                  "h-[18px] w-[18px] shrink-0 object-contain transition-all",
                  isActive
                    ? "opacity-100 brightness-0 invert"
                    : "opacity-70 group-hover:opacity-100 group-hover:brightness-0"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
