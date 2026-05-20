import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BookOpen, LayoutDashboard, Search, ClipboardList, User,
  LogOut, Bell, ChevronRight, X, CheckCircle, Clock, AlertTriangle
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { getLogsByUser, NotificationItem } from "../../../api/log.api";
import { motion, AnimatePresence } from "motion/react";


export default function StudentLayout() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const unread = notifs.filter(n => !n.is_read).length;

  useEffect(() => {
  if (user?.id) {
    fetchNotifications();
  }
}, [user]);

const fetchNotifications = async () => {
  try {
    setLoading(true);

    const data = await getLogsByUser(user!.id);

    setNotifs(data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  if (!user) return <Navigate to="/login/student" replace />;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
    { icon: Search, label: "Book Search", path: "/student/search" },
    { icon: ClipboardList, label: "My Requests", path: "/student/requests" },
    { icon: User, label: "My Profile", path: "/student/profile" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#065f46] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>LibraSys</p>
              <p className="text-emerald-300" style={{ fontSize: "0.65rem", lineHeight: 1.2 }}>Student Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-emerald-400 uppercase mb-3 px-3" style={{ fontSize: "0.65rem", letterSpacing: "0.1em" }}>Navigation</p>
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive ? "bg-white/15 text-white border border-white/20" : "text-emerald-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ width: "1.1rem", height: "1.1rem" }} className="flex-shrink-0" />
                  <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 400 }}>{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-300" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Privacy notice */}
        <div className="mx-4 mb-4 bg-white/10 border border-white/10 rounded-xl p-3">
          <p className="text-emerald-300" style={{ fontSize: "0.68rem", fontWeight: 600 }}>🔒 Privacy Protected</p>
          <p className="text-emerald-400 mt-0.5" style={{ fontSize: "0.65rem" }}>You can only access your own records</p>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/40 flex items-center justify-center text-white" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{user.name}</p>
              <p className="text-emerald-400 truncate" style={{ fontSize: "0.7rem" }}>STU-2026-001</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <LogOut style={{ width: "1rem", height: "1rem" }} />
            <span style={{ fontSize: "0.875rem" }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 relative z-20 flex-shrink-0">
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-600" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                  {unread}
                </span>
              )}
            </button>
            <AnimatePresence>
  {showNotifs && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >

      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <p
          className="text-gray-800"
          style={{ fontWeight: 600, fontSize: "0.9rem" }}
        >
          My Notifications
        </p>

        <button onClick={() => setShowNotifs(false)}>
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">

        {loading ? (

          <div className="p-4 text-center text-gray-400">
            Loading notifications...
          </div>

        ) : notifs.length === 0 ? (

          <div className="p-4 text-center text-gray-400">
            No notifications found
          </div>

        ) : (

          notifs.map((n) => {

            const icon =
              n.action === "APPROVE_BOOK_REQUEST" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : n.action === "DECLINE_BOOK_REQUEST" ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              );

            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${
                  !n.is_read
                    ? "bg-emerald-50/50"
                    : ""
                }`}
              >

                <div className="mt-0.5 flex-shrink-0">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">

                  <p
                    className="text-gray-700"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {n.description}
                  </p>

                  <p
                    className="text-gray-400 mt-0.5"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {new Date(n.created_at).toLocaleString()}
                  </p>

                </div>

                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                )}

              </div>
            );
          })

        )}

      </div>

    </motion.div>
  )}
</AnimatePresence>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-gray-600 hidden md:block" style={{ fontSize: "0.85rem" }}>{user.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
