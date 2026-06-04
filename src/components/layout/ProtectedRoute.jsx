import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { TOKEN_KEY } from "@/api/axios";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const tokenFromStorage = localStorage.getItem(TOKEN_KEY);

  if (!isAuthenticated || !tokenFromStorage) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
