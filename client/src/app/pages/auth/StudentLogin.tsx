import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, User, Eye, EyeOff, ArrowLeft, AlertCircle, Clock, Globe, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../../context/AppContext";
import { studentLogin } from "../../../api/auth.api.ts";

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your credentials.");
      return;
    }

    try {
      setLoading(true);
      const res = await studentLogin({ email, password });

      if (!res.token || !res.user) {
        throw new Error("Invalid login response");
      }
      login({
        token: res.token,
        user: {
          id: res.user.id,
          name: res.user.full_name,
          role: res.user.role,
        },
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem(
      "user",
      JSON.stringify(res.user)
      );
      navigate("/student/dashboard");

    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d5e] via-[#1a3f7a] to-[#0d2137] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-300/10 blur-3xl" />
      </div>
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6"
          style={{ fontSize: "0.875rem" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to portal
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#065f46] to-[#047857] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white" style={{ fontSize: "1.25rem", fontWeight: 700 }}>LibraSys</h1>
                <p className="text-emerald-200" style={{ fontSize: "0.75rem" }}>Student Portal</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-emerald-200" />
                <span className="text-emerald-100" style={{ fontSize: "0.7rem" }}>Student Access</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-gray-800 mb-1" style={{ fontSize: "1.125rem" }}>Student Sign In</h2>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>Use your student ID and password to access your library account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700" style={{ fontSize: "0.8rem" }}>{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-gray-700" style={{ fontSize: "0.85rem" }}>Student ID / Username</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. STU-2026-001 or student"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                style={{ fontSize: "0.9rem" }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-700" style={{ fontSize: "0.85rem" }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                  style={{ fontSize: "0.9rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#065f46] hover:bg-[#047857] text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Sign In to My Account
                </>
              )}
            <button type="button" onClick={() => setShowPrivacy(true)} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors" style={{ fontSize: "0.75rem" }} >
              <Globe className="w-3 h-3" />
              View Privacy Policy
            </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
