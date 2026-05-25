import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { useHero } from "../../hooks/useHero";

const SOCIALS = [
  {
    icon: FaGithub,
    href: `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`,
    label: "GitHub",
  },
  {
    icon: FaLinkedin,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com",
    label: "Instagram",
  },
];

const NAV_LINKS = [
  { label: "About", href: "#hero" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const { data: hero } = useHero();
  const currentYear = new Date().getFullYear();

  const initials = hero?.name
    ? hero.name
        .split(" ")
        .slice(0, 2)
        .map(w => w[0])
        .join("")
    : "JP";

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      {/* Blue glow — top-right */}
      <div className="pointer-events-none absolute -top-24 right-0 h-[300px] w-[300px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-14">
        {/* Main footer row */}
        <div className="flex flex-col gap-12 py-16 md:flex-row md:items-start md:justify-between">
          {/* Left — brand block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 max-w-[280px]"
          >
            {/* Monogram + name */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-blue-600 text-[11px] font-black text-white tracking-wider">
                {initials}
              </div>
              <span className="text-[13px] font-black uppercase tracking-[0.12em] text-foreground">
                {hero?.name || "Portfolio"}
              </span>
            </div>

            {/* Tagline */}
            <p className="text-[13px] leading-[1.75] text-muted-foreground/60">
              Full-stack developer crafting modern, scalable, and visually engaging digital
              experiences.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-200 hover:border-blue-500/30 hover:text-foreground hover:-translate-y-0.5"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right — nav links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/40 mb-1">
              Navigation
            </p>
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-medium text-muted-foreground/60 transition-colors duration-150 hover:text-foreground w-fit"
              >
                {label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row"
        >
          <p className="text-[11px] font-medium text-muted-foreground/35 tracking-wide">
            © {currentYear} {hero?.name || "Portfolio"}. Built with React, Node.js, and
            passion.
          </p>

          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/25">
            Designed &amp; Developed by{" "}
            <span className="text-blue-600/60 dark:text-blue-500/60">
              {hero?.name?.split(" ")[0] || "James"}
            </span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
