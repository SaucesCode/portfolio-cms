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
    w-full px-4 h-10 rounded-lg text-[11px] font-mono tracking-wide
    bg-background border border-border
    text-foreground placeholder:text-muted-foreground/40
    focus:outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10
    transition-all duration-150
  `;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center px-6 selection:bg-primary/10 selection:text-primary relative overflow-hidden">
      {/* Structural Subtle Workspace Grid Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none select-none" />

      <motion.div
        className="relative w-full max-w-[360px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        {/* Header Layout */}
        <div className="text-center mb-6 select-none">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-mono font-black text-sm tracking-wider mb-4 shadow-sm">
            VCS
          </div>
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
            Core Authentication
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground">
            Sign in to access secure system infrastructure
          </p>
        </div>

        {/* Form Container Frame */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] subpixel-antialiased"
        >
          {/* Email Form Field Block */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-0.5">
              Email Node Address
            </label>
            <div className="relative">
              <Mail
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@vcs.node"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Password Form Field Block */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-0.5">
              Secure Key Token
            </label>
            <div className="relative">
              <Lock
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputClass} pl-9 pr-9`}
              />
              {/* Toggle visibility input decorator */}
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Action Processing Handler */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 h-10 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors border border-transparent hover:bg-primary/90 mt-1 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                <span>Verifying Token...</span>
              </>
            ) : (
              <span>Establish Handshake</span>
            )}
          </button>
        </form>

        {/* Dynamic Context Root Exit Node */}
        <p className="text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mt-6 select-none">
          <a href="/" className="hover:text-foreground transition-colors">
            ← Disconnect Core Pipeline
          </a>
        </p>
      </motion.div>
    </div>
  );
}
