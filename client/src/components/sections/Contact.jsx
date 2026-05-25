import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[11px] font-medium text-red-500 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}

const CONTACT_LINKS = [
  {
    icon: Mail,
    label: "Email",
    display: "jamessdemesa@email.com",
    href: "mailto:jamessdemesa@email.com",
  },
  {
    icon: FaGithub,
    label: "GitHub",
    display: `github.com/${import.meta.env.VITE_GITHUB_USERNAME}`,
    href: `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`,
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    display: "https://www.linkedin.com/in/james-patrick-de-mesa",
    href: "https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.body.trim()) newErrors.body = "Message is required";
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", body: "" });
    } catch (error) {
      const message = error.response?.data?.error || "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `
    w-full px-4 py-2.5 rounded-xl text-[13px]
    bg-muted/60 border border-border
    text-foreground placeholder:text-muted-foreground/35
    focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.02]
    transition-all duration-200
  `;

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-background border-y border-border"
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      {/* Grid lines dark only */}
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px)," +
            "linear-gradient(to bottom,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,#000 40%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%,#000 40%,transparent 100%)",
        }}
      />

      {/* Blue glow bottom-left */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-[350px] w-[350px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-14 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-border inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              Get In Touch
            </span>
          </div>

          <div
            className="flex flex-wrap items-end gap-x-4 leading-[0.9] tracking-[-0.04em] font-black"
            style={{ fontSize: "clamp(40px, 7vw, 80px)" }}
          >
            <span
              className="text-transparent select-none"
              style={{
                WebkitTextStroke:
                  "1.5px color-mix(in srgb, var(--foreground) 22%, transparent)",
              }}
            >
              LET'S
            </span>
            <span className="text-foreground">WORK</span>
            <span className="text-blue-600 dark:text-blue-500">TOGETHER</span>
            <span className="text-blue-600 dark:text-blue-500">.</span>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
          {/* Left — info + links */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <p className="text-[14px] leading-[1.75] text-muted-foreground/70 max-w-[380px]">
              I'm currently available for freelance work and full-time positions. Have a
              project in mind or just want to say hi? I'd love to hear from you.
            </p>

            {/* Contact links */}
            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map(({ icon: Icon, label, display, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-all duration-300 hover:border-blue-500/25 hover:bg-blue-600/[0.02] hover:-translate-y-0.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/8 text-blue-600 dark:text-blue-400">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/40 mb-0.5">
                      {label}
                    </p>
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {display}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="text-muted-foreground/25 group-hover:text-blue-500 transition-colors shrink-0"
                  />
                </a>
              ))}
            </div>

            {/* Availability tag */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Usually responds within 24 hours
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-blue-600 to-violet-600 opacity-40" />

              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name" error={errors.name}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Juan dela Cruz"
                    className={inputClass}
                  />
                </Field>

                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@email.com"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Subject (optional)">
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Project inquiry"
                  className={inputClass}
                />
              </Field>

              <Field label="Message" error={errors.body}>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  placeholder="Tell me about your project..."
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {/* Divider */}
              <div className="h-px w-full bg-border" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/25 hover:-translate-y-px"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
