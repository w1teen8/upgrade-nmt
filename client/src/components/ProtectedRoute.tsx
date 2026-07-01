import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Завантаження...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Завантаження...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
