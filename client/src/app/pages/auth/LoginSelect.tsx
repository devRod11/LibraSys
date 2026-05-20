import { useNavigate } from "react-router-dom";
import { BookOpen, Shield, User, ChevronRight, Lock, Globe } from "lucide-react";
import { motion } from "motion/react";

export default function LoginSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d5e] via-[#1a3f7a] to-[#0d2137] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-300/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-white mb-1" style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 }}>LibraSys</h1>
          <p className="text-blue-200" style={{ fontSize: "0.9rem" }}>Smart Library Management Made Efficient</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-blue-400/40" />
            <Lock className="w-3 h-3 text-blue-400" />
            <p className="text-blue-400" style={{ fontSize: "0.75rem" }}>Secure Access Portal</p>
            <Lock className="w-3 h-3 text-blue-400" />
            <div className="h-px w-12 bg-blue-400/40" />
          </div>
        </div>

        {/* Login Cards */}
        <div className="space-y-4">
          <motion.button
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/20 hover:border-white/30 transition-all duration-200 group text-left"
            onClick={() => navigate("/login/admin")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/40 transition-colors">
              <Shield className="w-6 h-6 text-blue-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white" style={{ fontWeight: 600, fontSize: "1rem" }}>Administrator</p>
              <p className="text-blue-300 mt-0.5" style={{ fontSize: "0.8rem" }}>Full system access with 2FA security</p>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </motion.button>

          <motion.button
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/20 hover:border-white/30 transition-all duration-200 group text-left"
            onClick={() => navigate("/login/student")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/40 transition-colors">
              <User className="w-6 h-6 text-emerald-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white" style={{ fontWeight: 600, fontSize: "1rem" }}>Student</p>
              <p className="text-blue-300 mt-0.5" style={{ fontSize: "0.8rem" }}>Access your personal library records</p>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </motion.button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-blue-400" style={{ fontSize: "0.75rem" }}>
            <button className="hover:text-blue-200 transition-colors flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Privacy Policy
            </button>
            <span>•</span>
            <span>v2.1.0</span>
            <span>•</span>
            <span>© 2026 LibraSys</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
