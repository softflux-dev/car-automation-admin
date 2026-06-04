import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicRoute from "./components/layout/PublicRoute";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyCode from "./pages/auth/VerifyCode";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard";
import Packages from "./pages/dashboard/Packages";
import ServicesPage from "./pages/Services";
import AanvragenPage from "./pages/Aanvragen";
import PortfolioPage from "./pages/Portfolio/index";
import InstellingenPage from "./pages/Instellingen";
import { Toaster } from "./components/ui/toaster";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/inquiries" element={<AanvragenPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/settings" element={<InstellingenPage />} />
          </Route>
        </Route>

        {/* Public auth routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster />
    </BrowserRouter>
  );
};

export default App;
