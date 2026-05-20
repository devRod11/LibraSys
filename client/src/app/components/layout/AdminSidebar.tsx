import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen, LayoutDashboard, BookMarked, ClipboardList,
  BarChart3, LogOut, Bell, Settings, ChevronRight
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: BookMarked, label: "Book Management", path: "/admin/books" },
  { icon: ClipboardList, label: "Book Requests", path: "/admin/requests" },
  { icon: BarChart3, label: "Reports & Analytics", path: "/admin/reports" },
  { icon: Settings, label: "Settings",path: "/admin/settings"}
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAppContext();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-[#0f2d5e] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>LibraSys</p>
            <p className="text-blue-300" style={{ fontSize: "0.65rem", lineHeight: 1.2 }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-blue-400 uppercase mb-3 px-3" style={{ fontSize: "0.65rem", letterSpacing: "0.1em" }}>Navigation</p>
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: "1.1rem", height: "1.1rem" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-300" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="text-blue-400 uppercase mb-3 px-3" style={{ fontSize: "0.65rem", letterSpacing: "0.1em" }}>System</p>
          <NavLink
            to="/admin/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive ? "bg-white/15 text-white border border-white/20" : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Bell style={{ width: "1.1rem", height: "1.1rem" }} className="flex-shrink-0" />
            <span style={{ fontSize: "0.875rem" }}>Notifications</span>
            {}
          </NavLink>
        </div>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/40 flex items-center justify-center text-white" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white truncate" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Administrator</p>
            <p className="text-blue-400 truncate" style={{ fontSize: "0.7rem" }}>admin@librasys.edu</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150"
        >
          <LogOut style={{ width: "1rem", height: "1rem" }} className="flex-shrink-0" />
          <span style={{ fontSize: "0.875rem" }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
