import { Outlet } from "react-router-dom";
import brandLogo from "@/assets/icons/brandLogo.svg";
import loginSideImg from "@/assets/images/loginSideImg.png";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">

      {/* ── Left Panel: cover image + blue overlay ── */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src={loginSideImg}
          alt="Car wash facility"
          className="absolute inset-0 h-full w-full object-fill object-center"
        />
        {/* Subtle light overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.28) 100%)" }}
        />
      </div>

      {/* ── Right Panel: form area ── */}
      <div className="flex w-full flex-col bg-white lg:w-1/2">

        {/* Logo row — right-aligned desktop, centered mobile */}
        <div className="flex shrink-0 items-center justify-center px-6 pt-6 lg:justify-end lg:px-10 lg:pt-8">
          <img src={brandLogo} alt="Brand logo" className="h-14 lg:h-24" />
        </div>

        {/* Scrollable form container */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10 lg:px-16 lg:py-12">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
