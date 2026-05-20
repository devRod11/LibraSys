import { useEffect, useState, useMemo } from "react";
import { Bell, Search, X } from "lucide-react";
import {
  getAllLogs,
  NotificationItem,
  markNotificationRead,
  markAllNotificationsRead
} from "../../../api/log.api";
import { useAppContext } from "../../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
}

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const unread = notifications.filter(n => !n.is_read).length;
  
  const [currentTime, setCurrentTime] =
    useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAllLogs();

     setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (
  id: number
) => {

  try {

    await markNotificationRead(id);

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id
          ? { ...notif, is_read: true }
          : notif
      )
    );

  } catch (err) {

    console.error(err);
  }
};

const handleMarkAllRead = async () => {

  try {

    await markAllNotificationsRead();

    setNotifications(prev =>
      prev.map(notif => ({
        ...notif,
        is_read: true,
      }))
    );

  } catch (err) {

    console.error(err);
  }
};

  const typeColor: Record<string, string> = {
    CREATE_BOOK_REQUEST: "bg-blue-100 text-blue-600",
    APPROVE_BOOK_REQUEST: "bg-green-100 text-green-600",
    DECLINE_BOOK_REQUEST: "bg-red-100 text-red-600",
  };

  const filteredNotifications =
  useMemo(() => {

    if (!search.trim())
      return notifications;

    return notifications.filter(
      (notif) =>
        notif.description
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        notif.action
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  }, [notifications, search]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 relative z-20 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-gray-800 truncate" style={{ fontSize: "1.125rem" }}>{title}</h1>
        {subtitle && <p className="text-gray-400 truncate" style={{ fontSize: "0.75rem" }}>{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search notifications..."
          className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all w-64"
          style={{
            fontSize: "0.85rem",
          }}
        />
      </div>

      {/* Notifications */}
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
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <p className="text-gray-800" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Notifications</p>
                  {unread > 0 && <p className="text-blue-600" style={{ fontSize: "0.72rem" }}>{unread} unread</p>}
                </div>
                <div className="flex items-center gap-2">

                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-blue-600 hover:text-blue-700"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Mark all read
                    </button>
                  )}
                  {}
                  <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {filteredNotifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${!notif.is_read ? "bg-blue-50/50" : ""}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.is_read ? "bg-blue-500" : "bg-gray-300"}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-left" style={{ fontSize: "0.8rem" }}>{notif.description}</p>
                      <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.7rem" }}>{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${typeColor[notif.action] || "bg-gray-100 text-gray-600" }`} style={{ fontSize: "0.65rem" }}>
                      {notif.action}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date */}
      <div className="hidden lg:flex items-center gap-3 text-gray-500 border-l border-gray-100 pl-4" style={{ fontSize: "0.8rem",}}>
  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

  <div className="flex flex-col leading-tight">
      <span className="text-gray-700 font-medium">
        {currentTime.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )}
      </span>

      <span className="text-gray-400">
        {currentTime.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        )}
      </span>
    </div>

  </div>
    </header>
  );
}
