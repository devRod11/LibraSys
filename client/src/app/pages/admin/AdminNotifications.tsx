import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle,
} from "lucide-react";

import { motion } from "motion/react";

import { AdminTopbar } from "../../components/layout/AdminTopbar";

import {
  getAllLogs,
  NotificationItem,
} from "../../../api/log.api";

const iconMap: Record<string, React.ReactNode> = {
  CREATE_BOOK_REQUEST: (
    <BookOpen className="w-4 h-4 text-blue-600" />
  ),

  APPROVE_BOOK_REQUEST: (
    <CheckCircle className="w-4 h-4 text-green-600" />
  ),

  DECLINE_BOOK_REQUEST: (
    <AlertTriangle className="w-4 h-4 text-red-600" />
  ),
};

const bgMap: Record<string, string> = {
  CREATE_BOOK_REQUEST: "bg-blue-50",
  APPROVE_BOOK_REQUEST: "bg-green-50",
  DECLINE_BOOK_REQUEST: "bg-red-50",
};

export default function AdminNotifications() {
  const [logs, setLogs] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const data = await getAllLogs();

      setLogs(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      <AdminTopbar
        title="Notifications"
        subtitle="Stay updated with library activity"
      />

      <div className="p-6">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <p
              className="text-gray-800"
              style={{ fontWeight: 600 }}
            >
              Activity Logs
            </p>

            <p
              className="text-gray-400"
              style={{ fontSize: "0.8rem" }}
            >
              {logs.length} notifications
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {loading && (
            <div className="p-6 text-gray-400">
              Loading notifications...
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div className="p-6 text-gray-400">
              No notifications found
            </div>
          )}

          {logs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-start gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
            >

              <div
                className={`w-9 h-9 rounded-xl ${
                  bgMap[log.action] || "bg-gray-100"
                } flex items-center justify-center flex-shrink-0`}
              >
                {iconMap[log.action] || (
                  <Clock className="w-4 h-4 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-gray-800"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {log.description}
                </p>

                <p
                  className="text-gray-400 mt-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  {formatTime(log.created_at)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}