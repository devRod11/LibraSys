import { Outlet, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout() {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

 return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}