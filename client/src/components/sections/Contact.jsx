import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Send } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const DIRECT_LINKS = [
  {
    label: "Email",
    display: "jamesspatrickdm@gmail.com",
    href: "mailto:jamesspatrickdm@gmail.com",
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
    display: "linkedin.com/in/james-patrick-de-mesa",
    href: "https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/",
  },
];

// Inline "fill-in" input — no border box, just an underline that lights up on focus
function GhostInput({ as = "input", className = "", style, ...props }) {
  const Tag = as;
  return (
    <Tag
      className={`inline-block bg-transparent border-0 border-b-2 outline-none px-1 pb-0.5 transition-colors duration-200 placeholder:italic placeholder:opacity-100 placeholder:text-[var(--muted-foreground)] ${className}`}
      style={{
        borderColor: "var(--rule)",
        color: "var(--foreground)",
        fontFamily: "inherit",
        ...style, // caller's style (e.g. width) now merges with, rather than replaces, the base styles
      }}
      onFocus={e => (e.target.style.borderColor = "var(--signal)")}
      onBlur={e => (e.target.style.borderColor = "var(--rule)")}
      {...props}
    />
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "your name";
    if (!form.email.trim()) newErrors.email = "a valid email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "a valid email";
    if (!form.body.trim()) newErrors.body = "a short message";
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
      setSent(true);
      setForm({ name: "", email: "", subject: "", body: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong. Try again?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const missing = Object.values(errors).filter(Boolean);

  return (
    <section
      id="contact"
      className="border-t"
      style={{ background: "var(--background)", borderColor: "var(--rule)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-16 md:gap-20">
          {/* Left — the invitation + colophon */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="mono-label text-[11px] mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              006 — get in touch
            </p>
            <h2
              className="font-black tracking-[-0.03em] leading-[0.98] mb-6"
              style={{ fontSize: "clamp(36px, 5.2vw, 62px)" }}
            >
              Got something
              <br />
              worth <span className="accent-word">building</span>?
            </h2>
            <p
              className="max-w-[360px] text-[14.5px] leading-[1.8] mb-12"
              style={{ color: "var(--muted-foreground)" }}
            >
              I read every message myself. If it's a project, a role, or just a question about
              something I built — say hello below, or reach me directly.
            </p>

            <div className="flex items-center gap-2.5 mb-8">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ background: "var(--signal-warm)" }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--signal-warm)" }}
                />
              </span>
              <span className="mono-label text-[11px]" style={{ color: "var(--signal-warm)" }}>
                Usually replies within 24 hours
              </span>
            </div>

            {/* Colophon — direct links, set like a magazine's masthead credits */}
            <div className="border-t" style={{ borderColor: "var(--rule)" }}>
              {DIRECT_LINKS.map(({ icon: Icon, label, display, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-4 border-b transition-colors"
                  style={{ borderColor: "var(--rule)" }}
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span
                      className="mono-label text-[10px] uppercase tracking-wider w-16 shrink-0"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {label}
                    </span>
                    <span className="text-[13.5px] font-medium truncate transition-colors group-hover:opacity-70">
                      {display}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right — the sentence-form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {sent ? (
              <div className="flex flex-col justify-center h-full min-h-[360px]">
                <p
                  className="mb-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: "clamp(28px,4vw,40px)",
                    color: "var(--signal)",
                  }}
                >
                  Message sent.
                </p>
                <p
                  className="text-[14px] leading-[1.8]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Thanks for reaching out — I'll get back to you soon. In the meantime, feel
                  free to poke around the rest of the site.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 text-[12px] font-bold uppercase tracking-wider border-b-2 pb-0.5 w-fit"
                  style={{ borderColor: "var(--signal)" }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* The sentence itself */}
                <p
                  className="leading-[2.1] md:leading-[2.3]"
                  style={{
                    fontSize: "clamp(20px, 2.6vw, 28px)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Hi, my name is{" "}
                  <GhostInput
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="your name"
                    aria-label="Your name"
                    style={{ width: "9ch" }}
                  />
                  . You can reach me back at{" "}
                  <GhostInput
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    aria-label="Your email"
                    style={{ width: "16ch" }}
                  />{" "}
                  — I wanted to talk about{" "}
                  <GhostInput
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="a project"
                    aria-label="Subject"
                    style={{ width: "12ch" }}
                  />
                  .
                </p>

                {/* The message — full width, still borderless/underlined */}
                <div className="mt-10">
                  <label
                    htmlFor="contact-body"
                    className="mono-label text-[10px] uppercase tracking-wider block mb-3"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    The details
                  </label>
                  <textarea
                    id="contact-body"
                    name="body"
                    value={form.body}
                    onChange={handleChange}
                    placeholder="Tell me what you're building, or what you need — as much or as little detail as you like."
                    rows={4}
                    className="w-full bg-transparent border-0 border-b-2 outline-none py-2 text-[14.5px] leading-[1.8] resize-none transition-colors duration-200 placeholder:italic placeholder:opacity-100 placeholder:text-[var(--muted-foreground)]"
                    style={{ borderColor: "var(--rule)", color: "var(--foreground)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--signal)")}
                    onBlur={e => (e.target.style.borderColor = "var(--rule)")}
                  />
                </div>

                {missing.length > 0 && (
                  <p className="mt-4 text-[12px]" style={{ color: "var(--signal-warm)" }}>
                    Still need: {missing.join(", ")}.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group mt-10 inline-flex items-center gap-2.5 px-6 py-3 text-[12px] font-bold uppercase tracking-wider transition-opacity disabled:opacity-50"
                  style={{ background: "var(--signal)", color: "var(--background)" }}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="h-3.5 w-3.5 rounded-full border-2 animate-spin"
                        style={{
                          borderColor:
                            "color-mix(in oklch, var(--background) 40%, transparent)",
                          borderTopColor: "var(--background)",
                        }}
                      />
                      Sending
                    </>
                  ) : (
                    <>
                      Send it over
                      <Send
                        size={13}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
