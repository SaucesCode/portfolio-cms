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
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      // Store user in AuthContext
      login(res.data.user);

      toast.success("Welcome back!");
      navigate("/admin");
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `
    w-full px-4 py-2.5 rounded-lg text-sm
    bg-gray-900 border border-white/10
    text-white placeholder:text-gray-600
    focus:outline-none focus:border-blue-500/50
    transition-all duration-200
  `;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <Lock size={20} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Admin Login</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your portfolio</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-white/5 rounded-2xl p-6 flex flex-col gap-4"
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">Email</label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@portfolio.com"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">Password</label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputClass} pl-9 pr-9`}
              />
              {/* Toggle password visibility */}
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Back to portfolio link */}
        <p className="text-center text-xs text-gray-600 mt-6">
          <a href="/" className="hover:text-gray-400 transition-colors">
            ← Back to portfolio
          </a>
        </p>
      </motion.div>
    </div>
  );
}
