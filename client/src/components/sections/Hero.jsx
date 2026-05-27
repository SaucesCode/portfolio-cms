import { ArrowRight, Download, Eye, MapPin, Zap } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { useHero } from "../../hooks/useHero";
import Typewriter from "typewriter-effect";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

const TICKER_ITEMS = [
  "React",
  "·",
  "Node.js",
  "·",
  "TypeScript",
  "·",
  "PostgreSQL",
  "·",
  "Django",
  "·",
  "Express",
  "·",
  "Prisma",
  "·",
  "Tailwind CSS",
  "·",
  "Docker",
  "·",
  "REST APIs",
  "·",
  "Git",
  "·",
  "Framer Motion",
  "·",
];

export default function Hero() {
  const { data: hero, isLoading } = useHero();

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-xs tracking-[0.3em] uppercase animate-pulse">
          Loading
        </div>
      </section>
    );
  }

  // Fallback taglines if none set in DB
  const taglines = hero?.tagline?.length
    ? hero.tagline
    : ["Full-Stack Developer", "UI/UX Enthusiast", "Open to Remote Work"];

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-background"
      style={{ minHeight: "100svh" }}
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
      {/* Blue glow top-right */}
      <div className="pointer-events-none absolute -top-32 right-0 z-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 dark:bg-blue-500/12 blur-[120px]" />
      {/* Faint second blob bottom-left */}
      <div className="pointer-events-none absolute bottom-0 -left-24 z-0 h-[400px] w-[400px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[100px]" />
      {/* Grid lines dark mode */}
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,0.04) 1px,transparent 1px)," +
            "linear-gradient(to bottom,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%,#000 50%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 40%,#000 50%,transparent 100%)",
        }}
      />

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 md:px-14 pt-28 pb-0">
        {/* Status row */}
        <motion.div {...fadeUp(0)} className="mb-10 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
            <span className="h-px w-6 bg-border inline-block" />
            Full-Stack Developer
          </div>
          {hero?.availableForWork && (
            <div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/8 px-3 py-1 text-[11px] font-medium text-green-600 dark:text-green-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
              </span>
              Open to work
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 ml-auto">
            <MapPin size={11} />
            Philippines · Remote
          </div>
        </motion.div>

        {/* Split headline + photo */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
          {/* Left — headline */}
          <div>
            <motion.div {...fadeUp(0.06)}>
              <span
                className="block font-black leading-[0.9] tracking-[-0.04em] select-none"
                style={{
                  fontSize: "clamp(52px, 9vw, 118px)",
                  WebkitTextStroke:
                    "1.5px color-mix(in srgb, var(--foreground) 22%, transparent)",
                  color: "transparent",
                }}
                aria-hidden
              >
                BUILDING
              </span>
            </motion.div>

            <motion.div {...fadeUp(0.12)}>
              <span
                className="block font-black leading-[0.9] tracking-[-0.04em] text-foreground"
                style={{ fontSize: "clamp(52px, 9vw, 118px)" }}
              >
                DIGITAL
              </span>
            </motion.div>

            <motion.div {...fadeUp(0.18)}>
              <span
                className="block font-black leading-[0.9] tracking-[-0.04em] text-blue-600 dark:text-blue-500"
                style={{ fontSize: "clamp(52px, 9vw, 118px)" }}
              >
                PRODUCTS
              </span>
            </motion.div>

            {/* Subtext + CTAs */}
            <motion.div
              {...fadeUp(0.26)}
              className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6"
            >
              <p
                className="max-w-[400px] leading-[1.7] text-muted-foreground"
                style={{ fontSize: "14.5px" }}
              >
                {hero?.bio ||
                  "I craft fast, accessible web applications end-to-end — from database schema to polished UI. Passionate about clean code and great UX."}
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px shadow-lg shadow-blue-600/20"
                >
                  Projects
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </a>
                {hero?.resumeUrl && (
                  <a
                    href={hero.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background hover:bg-muted px-5 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <Eye size={13} />
                    Resume
                  </a>
                )}
              </div>
            </motion.div>

            {/* Socials */}
            <motion.div {...fadeUp(0.32)} className="mt-6 flex items-center gap-2.5">
              <SocialBtn
                href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
                label="GitHub"
              >
                <FaGithub size={15} />
              </SocialBtn>
              <SocialBtn
                href="https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/"
                label="LinkedIn"
              >
                <FaLinkedin size={15} />
              </SocialBtn>
            </motion.div>
          </div>

          {/* Right — photo column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block relative self-end"
            style={{ width: "clamp(200px, 22vw, 300px)" }}
          >
            {/* Floating name tag */}
            <div className="absolute -top-3 -left-3 z-10 flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5 shadow-sm text-[11px] font-medium text-muted-foreground">
              <Zap size={10} className="text-blue-500" />
              {hero?.name?.split(" ")[0] || "James"}
            </div>

            {/* Photo frame */}
            <div
              className="relative overflow-hidden rounded-t-[20px]"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={hero?.profileImageUrl || "https://via.placeholder.com/300x400"}
                alt={hero?.name || "Profile"}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent" />
            </div>

            {/* ── Typewriter strip — sits flush under photo ─────── */}
            <div className="border-x border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-2 min-h-[44px]">
              <span className="text-[11px] font-medium text-muted-foreground/50 shrink-0">
                I'm a
              </span>
              <span className="text-[12px] font-semibold truncate">
                <Typewriter
                  options={{
                    strings: taglines,
                    autoStart: true,
                    loop: true,
                    delay: 65,
                    deleteSpeed: 35,
                  }}
                />
              </span>
            </div>

            {/* Mini stat strip */}
            <div className="grid grid-cols-3 border border-t-0 border-border rounded-b-[20px] overflow-hidden">
              {[
                { num: "4+", label: "Yrs" },
                { num: "10+", label: "Projects" },
                { num: "∞", label: "Coffee" },
              ].map(({ num, label }, i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center py-3 bg-card ${i < 2 ? "border-r border-border" : ""}`}
                >
                  <span className="text-[16px] font-bold text-blue-600 dark:text-blue-500 leading-none">
                    {num}
                  </span>
                  <span className="text-[9.5px] font-medium uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ticker tape */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 mt-10 overflow-hidden border-y border-border bg-muted/40 py-3"
      >
        <Ticker items={TICKER_ITEMS} />
      </motion.div>
    </section>
  );
}

/* ── Ticker ─────────────────────────────────────────────────── */
function Ticker({ items }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="flex">
      <motion.div
        className="flex shrink-0 gap-6 pr-6 items-center"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className={
              item === "·"
                ? "text-blue-500 text-[10px] shrink-0"
                : "shrink-0 text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70 whitespace-nowrap"
            }
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── SocialBtn ───────────────────────────────────────────────── */
function SocialBtn({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200 hover:-translate-y-0.5"
    >
      {children}
    </a>
  );
}
