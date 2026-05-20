import { Routes, Route, Navigate } from "react-router-dom";

// auth
import LoginSelect from "./pages/auth/LoginSelect";
import StudentLogin from "./pages/auth/StudentLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import Admin2FA from "./pages/auth/Admin2FA";

// layouts
import AdminLayout from "./components/layout/AdminLayout";
import StudentLayout from "./components/layout/StudentLayout";

// guards
import { AdminRoute, StudentRoute } from "../ProtectedRoute";

// pages (admin)
import AdminDashboard from "./pages/admin/AdminDashboard";
import BookManagement from "./pages/admin/BookManagement";
import RequestManagement from "./pages/admin/RequestManagement";
import Reports from "./pages/admin/Reports";
import AdminNotification from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

// pages (student)
import StudentDashboard from "./pages/student/StudentDashboard";
import BookSearch from "./pages/student/BookSearch";
import MyRequests from "./pages/student/MyRequests";
import Profile from "./pages/student/Profile";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =======================
          DEFAULT ROUTE
      ======================= */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* =======================
          AUTH ROUTES
      ======================= */}
      <Route path="/login" element={<LoginSelect />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/admin/2fa" element={<Admin2FA />} />

      {/* =======================
          ADMIN ROUTES (PROTECTED)
      ======================= */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<BookManagement />} />
          <Route path="notifications" element={<AdminNotification />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />

        </Route>
      </Route>

      {/* =======================
          STUDENT ROUTES (PROTECTED)
      ======================= */}
      <Route path="/student" element={<StudentRoute />}>
        <Route element={<StudentLayout />}>

          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="search" element={<BookSearch />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="profile" element={<Profile />} />

        </Route>
      </Route>

      {/* =======================
          404 FALLBACK
      ======================= */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />

    </Routes>
  );
}