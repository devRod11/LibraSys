import { useEffect, useState } from "react";
import {
  BookOpen,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  BookMarked,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminTopbar } from "../../components/layout/AdminTopbar";
import {
  getDashboardStats,
  getBorrowTrends,
  getCategoryDistribution,
  getTopBorrowedBooks,
} from "../../../api/dashboard.api";
import { getAllRequests } from "../../../api/request.api";
import { getAllLogs } from "../../../api/log.api";
import { motion } from "motion/react";
import { socket } from "../../../socket"; 

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [borrowTrends, setBorrowTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetchDashboard();

    socket.on("dashboardUpdated", () => {
      fetchDashboard();
    });

    return () => {
      socket.off("dashboardUpdated");
    };
  }, []);
  const fetchDashboard = async () => {
    try {
      const [
        statsData,
        trendsData,
        categoriesData,
        booksData,
        requestsData,
        logsData,
      ] = await Promise.all([
        getDashboardStats(),
        getBorrowTrends(),
        getCategoryDistribution(),
        getTopBorrowedBooks(),
        getAllRequests(),
        getAllLogs(),
      ]);

      setStats(statsData);
      setBorrowTrends(trendsData);
      setCategories(categoriesData);
      setTopBooks(booksData);
      setRequests(requestsData);
      setLogs(logsData);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  const statCards = [
    {
      label: "Total Books",
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      change: "+12",
      changeType: "up",
      color: "bg-blue-500",
      light: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },

    {
      label: "Borrowed Books",
      value: stats?.borrowedBooks || 0,
      icon: BookMarked,
      change: "+8",
      changeType: "up",
      color: "bg-emerald-500",
      light: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },

    {
      label: "Overdue Books",
      value: stats?.overdueBooks || 0,
      icon: AlertTriangle,
      change: "+3",
      changeType: "down",
      color: "bg-red-500",
      light: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
    },

    {
      label: "Pending Requests",
      value: stats?.pendingRequests || 0,
      icon: Clock,
      change: "+5",
      changeType: "neutral",
      color: "bg-amber-500",
      light: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
  ];

  const pendingRequests = requests.filter(
    (r: any) => r.status === "pending"
  );

  return (
    <div>
      <AdminTopbar
        title="Dashboard"
        subtitle="Welcome back, Administrator"
      />

      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-xl p-5 border ${card.border} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">

                <div
                  className={`w-10 h-10 rounded-xl ${card.light} flex items-center justify-center`}
                >
                  <card.icon className={`w-5 h-5 ${card.text}`} />
                </div>

                <span
                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${
                    card.changeType === "down"
                      ? "bg-red-50 text-red-500"
                      : card.changeType === "up"
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  {card.changeType === "down" ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}

                  {card.change}
                </span>
              </div>

              <p
                className="text-gray-800"
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </p>

              <p
                className="text-gray-500 mt-1"
                style={{ fontSize: "0.8rem" }}
              >
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Borrow Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={borrowTrends}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="borrows"
                  stroke="#2563eb"
                  fill="#2563eb"
                />

                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#10b981"
                  fill="#10b981"
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                >
                  {categories.map((_: any, idx: number) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

          <div className="space-y-3">
            {pendingRequests.slice(0, 3).map((req: any) => (
              <div
                key={req.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
              >
                <div className="flex-1">
                  <p>{req.bookTitle}</p>

                  <p className="text-sm text-gray-500">
                    {req.studentName}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </button>

                  <button className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

          <div className="space-y-3">
            {logs.slice(0, 5).map((log: any) => (
              <div
                key={log.id}
                className="flex items-start gap-3"
              >
                <div className="flex-1">
                  <p>{log.action}</p>

                  <p className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Borrowed */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topBooks} layout="vertical">

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis
                dataKey="title"
                type="category"
                width={160}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  );
}