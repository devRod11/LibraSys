import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Shield, ArrowLeft, CheckCircle2, RefreshCw, Monitor } from "lucide-react";
import { motion } from "motion/react";
import { verify2FA } from "../../../api/auth.api";
import { useAppContext } from "../../context/AppContext";


export default function Admin2FA() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const API_URL = import.meta.env.VITE_API_URL;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleResend = async () => {
  try {
    const tempToken = localStorage.getItem("temp_token");

    if (!tempToken) {
      setError("Session expired");
      return;
    }

    setLoading(true);

    await fetch(`${API_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tempToken}`,
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message);
    }
    
    // SAVE NEW TEMP TOKEN
    localStorage.setItem("temp_token", data.tempToken);

    setOtp(["", "", "", "", "", ""]);
    setTimeLeft(120);
    setResendDisabled(true);
    setError("");

    inputRefs.current[0]?.focus();

  } catch (err: any) {
    setError(err.message || "Failed to resend OTP");
  } finally {
    setLoading(false);
  }
};

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await verify2FA(code);

    // ✅ Save real session
      login({
        token: res.token,
          user: {
            id: res.user.id,
            name: res.user.full_name || res.user.name,
            role: res.user.role,
          },
        });

      localStorage.removeItem("temp_token");
      console.log("2FA SUCCESS", res);
      navigate("/admin/dashboard");

    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d5e] via-[#1a3f7a] to-[#0d2137] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate("/login/admin")}
          className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6"
          style={{ fontSize: "0.875rem" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f2d5e] to-[#1a3f7a] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white" style={{ fontSize: "1.25rem", fontWeight: 700 }}>LibraSys</h1>
                <p className="text-blue-200" style={{ fontSize: "0.75rem" }}>Two-Factor Authentication</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1.5">
                <Shield className="w-3.5 h-3.5 text-green-300" />
                <span className="text-green-200" style={{ fontSize: "0.7rem" }}>2FA Active</span>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => handleVerify(e)} className="p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-gray-800 mb-1" style={{ fontSize: "1.125rem" }}>Verify Your Identity</h2>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                A 6-digit verification code has been sent to your registered email address.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-700" style={{ fontSize: "0.8rem" }}>{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-11 h-13 text-center border-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-800"
                  style={{ fontSize: "1.25rem", fontWeight: 700, height: "3.25rem" }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between mb-5">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeLeft > 0 ? "bg-blue-50 border border-blue-100" : "bg-red-50 border border-red-100"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${timeLeft > 0 ? "bg-blue-500" : "bg-red-500"}`} />
                <span className={`${timeLeft > 0 ? "text-blue-700" : "text-red-600"}`} style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code expired"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                style={{ fontSize: "0.8rem" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend Code
              </button>
            </div>

            {/* Trust Device */}
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer mb-5 hover:bg-blue-50/50 hover:border-blue-100 transition-colors">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={e => setTrustDevice(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 w-4 h-4"
              />
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-700" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Trust this device</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Skip 2FA on this device for 30 days</p>
                </div>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full bg-[#0f2d5e] hover:bg-[#1a3f7a] text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
