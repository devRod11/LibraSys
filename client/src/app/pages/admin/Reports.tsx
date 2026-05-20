import { useEffect, useState } from "react";
import {
  BarChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Download,
  Activity,
  Award,
  Clock,
} from "lucide-react";
import { motion } from "motion/react";
import { AdminTopbar } from "../../components/layout/AdminTopbar";
import {
  getDashboardStats,
  getBorrowTrends,
  getCategoryDistribution,
  getTopBorrowedBooks,
} from "../../../api/dashboard.api";
import { getAllLogs } from "../../../api/log.api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function Reports() {

  const [stats, setStats] = useState<any>(null);

  const [monthlyBorrows, setMonthlyBorrows] =
    useState<any[]>([]);

  const [topBooks, setTopBooks] =
    useState<any[]>([]);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [logs, setLogs] =
    useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {

    try {

      const [
        statsData,
        trendsData,
        categoriesData,
        booksData,
        logsData,
      ] = await Promise.all([
        getDashboardStats(),
        getBorrowTrends(),
        getCategoryDistribution(),
        getTopBorrowedBooks(),
        getAllLogs(),
      ]);

      setStats(statsData);

      setMonthlyBorrows(trendsData);

      setCategories(categoriesData);

      setTopBooks(booksData);

      setLogs(logsData);

    } catch (err) {

      console.error("Reports Fetch Error:", err);

    }
  };

  const summaryStats = [
    {
      label: "Total Borrows",
      value: stats?.borrowedBooks || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+15%",
      up: true,
    },

    {
      label: "Total Books",
      value: stats?.totalBooks || 0,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      change: "+8%",
      up: true,
    },

    {
      label: "Overdue Books",
      value: stats?.overdueBooks || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      change: "-0.5d",
      up: false,
    },

    {
      label: "Pending Requests",
      value: stats?.pendingRequests || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      change: "+2.1%",
      up: true,
    },
  ];

  const exportReportPDF = () => {

  const doc = new jsPDF();

  // =========================
  // HEADER
  // =========================
  doc.setFontSize(20);

  doc.text("LibraSys Reports & Analytics", 14, 20);

  doc.setFontSize(11);

  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    14,
    28
  );

  // =========================
  // SUMMARY STATS
  // =========================
  doc.setFontSize(14);

  doc.text("Summary Statistics", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [["Metric", "Value"]],
    body: summaryStats.map((stat) => [
      stat.label,
      String(stat.value),
    ]),
  });

  // =========================
  // TOP BORROWED BOOKS
  // =========================
  const topBooksY =
    (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);

  doc.text("Top Borrowed Books", 14, topBooksY);

  autoTable(doc, {
    startY: topBooksY + 5,
    head: [["Rank", "Book Title", "Borrow Count"]],
    body: topBooks.map((book: any, index: number) => [
      index + 1,
      book.title,
      book.count,
    ]),
  });

  // =========================
  // CATEGORY DISTRIBUTION
  // =========================
  const categoryY =
    (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);

  doc.text("Category Distribution", 14, categoryY);

  autoTable(doc, {
    startY: categoryY + 5,
    head: [["Category", "Percentage"]],
    body: categories.map((cat: any) => [
      cat.name,
      `${cat.value}%`,
    ]),
  });

  // =========================
  // ACTIVITY LOGS
  // =========================
  const logsY =
    (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);

  doc.text("Audit Trail", 14, logsY);

  autoTable(doc, {
    startY: logsY + 5,
    head: [["Action", "User", "Book", "Date"]],
    body: logs.map((log: any) => [
      log.action,
      log.full_name || "-",
      log.book_title || "-",
      new Date(log.created_at).toLocaleString(),
    ]),
    styles: {
      fontSize: 8,
    },
  });

  // =========================
  // SAVE PDF
  // =========================
  doc.save(
    `LibraSys_Report_${Date.now()}.pdf`
  );
};

  return (
    <div>

      <AdminTopbar
        title="Reports & Analytics"
        subtitle="Insights and statistics for library operations"
      />

      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-blue-600" />

            <span
              className="text-blue-700"
              style={{ fontSize: "0.85rem" }}
            >
              Fiscal Year 2026
            </span>
          </div>

          <button
            onClick={exportReportPDF}
            className="flex items-center gap-2 bg-[#0f2d5e] hover:bg-[#1a3f7a] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <Download className="w-4 h-4" />

            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {summaryStats.map((stat, i) => (

            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >

              <div className="flex items-center justify-between mb-3">

                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon
                    className={`w-5 h-5 ${stat.color}`}
                  />
                </div>

                <span
                  className={`px-2 py-0.5 rounded-lg ${
                    stat.up
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  {stat.change}
                </span>
              </div>

              <p
                className="text-gray-800"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {stat.value}
              </p>

              <p
                className="text-gray-500 mt-0.5"
                style={{ fontSize: "0.78rem" }}
              >
                {stat.label}
              </p>

            </motion.div>
          ))}
        </div>

        {/* Borrow Trends */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="text-gray-800">
                Monthly Borrowing Trends
              </h3>

              <p
                className="text-gray-400 mt-0.5"
                style={{ fontSize: "0.8rem" }}
              >
                Total books borrowed per month
              </p>
            </div>

          </div>

          <ResponsiveContainer width="100%" height={240}>

            <AreaChart data={monthlyBorrows}>

              <defs>
                <linearGradient
                  id="monthGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2563eb"
                    stopOpacity={0.2}
                  />

                  <stop
                    offset="95%"
                    stopColor="#2563eb"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 12,
                  fill: "#94a3b8",
                }}
              />

              <YAxis />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="borrows"
                stroke="#2563eb"
                fill="url(#monthGrad)"
              />

            </AreaChart>

          </ResponsiveContainer>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Top Books */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />

              <h3 className="text-gray-800">
                Top Borrowed Books
              </h3>
            </div>

            <div className="space-y-3">

              {topBooks.map((book: any, idx: number) => (

                <div
                  key={book.title}
                  className="flex items-center gap-3"
                >

                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white bg-blue-500"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">

                    <p
                      className="text-gray-700 truncate"
                      style={{ fontSize: "0.825rem" }}
                    >
                      {book.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1">

                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (book.count /
                                topBooks[0]?.count) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                      <span
                        className="text-gray-400"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {book.count}
                      </span>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

            <h3 className="text-gray-800 mb-4">
              Category Distribution
            </h3>

            <ResponsiveContainer width="100%" height={160}>

              <PieChart>

                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
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

          {/* Activity Logs */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

            <div className="flex items-center gap-2 mb-4">

              <Activity className="w-4 h-4 text-blue-500" />

              <h3 className="text-gray-800">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3">

              {logs.slice(0, 5).map((log: any) => (

                <div
                  key={log.id}
                  className="border-b border-gray-100 pb-2"
                >

                  <p
                    className="text-gray-700"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {log.action}
                  </p>

                  <p
                    className="text-gray-400"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
                  </p>

                </div>

              ))}
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

          <div className="flex items-center gap-2 mb-4">

            <Activity className="w-4 h-4 text-blue-500" />

            <h3 className="text-gray-800">
              Audit Trail
            </h3>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-100">

                  <th className="text-left py-2 px-3">
                    Action
                  </th>

                  <th className="text-left py-2 px-3">
                    User
                  </th>

                  <th className="text-left py-2 px-3">
                    Book
                  </th>

                  <th className="text-left py-2 px-3">
                    Timestamp
                  </th>

                </tr>
              </thead>

              <tbody>

                {logs.map((log: any) => (

                  <tr
                    key={log.id}
                    className="border-b border-gray-50"
                  >

                    <td className="py-3 px-3">
                      {log.action}
                    </td>

                    <td className="py-3 px-3">
                      {log.full_name || "-"}
                    </td>

                    <td className="py-3 px-3">
                      {log.book_title || "-"}
                    </td>

                    <td className="py-3 px-3">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </td>

                  </tr>

                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}