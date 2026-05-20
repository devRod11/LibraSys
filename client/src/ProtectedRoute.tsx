import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "./app/context/AppContext";

export function AdminRoute() {
  const { user, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login/admin" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/login/admin" replace />;
  }

  return <Outlet />;
}

export function StudentRoute() {
  const { user, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login/student" replace />;
  }

  if (user.role !== "student") {
    return <Navigate to="/login/student" replace />;
  }

  return <Outlet />;
}