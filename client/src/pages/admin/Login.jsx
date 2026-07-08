import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Enter your email and password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (error) {
      const message =
        error.response?.data?.error || "Couldn't sign in — check your details and try again";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 h-11 rounded-lg text-[13.5px] outline-none transition-colors";
  const inputStyle = {
    border: "1px solid var(--rule)",
    background: "var(--background)",
    color: "var(--foreground)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <motion.div
        className="relative w-full max-w-[360px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        {/* Wordmark — same mark used in AdminLayout's sidebar, so this page reads as the front door of the same product */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[13px] font-bold mb-4"
            style={{ background: "var(--signal)", color: "var(--background)" }}
          >
            W
          </div>
          <h1 className="text-[17px] font-bold tracking-[-0.01em] mb-1">Workbench</h1>
          <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            Sign in to manage your portfolio
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--rule)",
            boxShadow: "0 8px 30px -12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium px-0.5">Email</label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="username"
                className={`${inputClass} pl-10`}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium px-0.5">Password</label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputClass} pl-10 pr-10`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--muted-foreground)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 h-11 rounded-lg text-[13.5px] font-semibold transition-opacity disabled:opacity-50 mt-1"
            style={{ background: "var(--signal)", color: "var(--background)" }}
          >
            {isLoading ? (
              <>
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "color-mix(in oklch, var(--background) 40%, transparent)",
                    borderTopColor: "var(--background)",
                  }}
                />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p
          className="text-center text-[12px] mt-6"
          style={{ color: "var(--muted-foreground)" }}
        >
          <a href="/" className="transition-colors hover:opacity-70">
            ← Back to the portfolio
          </a>
        </p>
      </motion.div>
    </div>
  );
}
