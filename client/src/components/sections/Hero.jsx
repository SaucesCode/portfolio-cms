import { ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { useHero } from "../../hooks/useHero";
import Typewriter from "typewriter-effect";

const SPECS = [
  { k: "role", v: "Full-Stack Developer" },
  { k: "base", v: "Philippines / Remote" },
  { k: "stack", v: "React · Node · Postgres" },
  { k: "status", v: "Open to work" },
];

export default function Hero() {
  const { data: hero, isLoading } = useHero();
  if (isLoading) return <section id="hero" className="min-h-[80vh]" />;

  const taglines = hero?.tagline?.length
    ? hero.tagline
    : ["Full-Stack Developer", "Systems Thinker", "Open to Remote Work"];

  return (
    <section
      id="hero"
      className="relative pt-28 pb-20 md:pt-36"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-3 text-[11px] font-mono tracking-wide"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span className="h-px w-6" style={{ background: "var(--rule)" }} />
          13.94° N, 121.61° E — City from the Philippines
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-14 md:gap-10 items-start">
          {/* Left — headline, bio, CTAs */}
          <div className="md:pt-2">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="font-black leading-[0.94] tracking-[-0.03em]"
              style={{ fontSize: "clamp(42px, 5.6vw, 84px)" }}
            >
              I build software
              <br />
              that feels{" "}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--signal)",
                }}
              >
                deliberate
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 max-w-[420px] text-[15px] leading-[1.75]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {hero?.bio ||
                "Full-stack developer working end-to-end — from schema design to the pixel. I care about the parts most people skip: loading states, error copy, the 40ms between click and response."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-7 flex items-center gap-2 text-[12px] font-mono"
              style={{ color: "var(--muted-foreground)" }}
            >
              currently —
              <span style={{ color: "var(--signal)" }}>
                <Typewriter
                  options={{
                    strings: taglines,
                    autoStart: true,
                    loop: true,
                    delay: 55,
                    deleteSpeed: 30,
                  }}
                />
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
            >
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 text-[13px] font-bold tracking-tight pb-1 border-b-2 transition-colors"
                style={{ borderColor: "var(--signal)" }}
              >
                View the work
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              {hero?.resumeUrl && (
                <a
                  href={hero.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-mono transition-colors hover:text-foreground"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  résumé.pdf ↓
                </a>
              )}
              <div
                className="flex items-center gap-3 ml-0 sm:ml-auto"
                style={{ color: "var(--muted-foreground)" }}
              >
                <a
                  href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="transition-colors hover:text-foreground"
                >
                  <FaGithub size={16} />
                </a>
                <a
                  href="https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="transition-colors hover:text-foreground"
                >
                  <FaLinkedin size={16} />
                </a>
              </div>
            </motion.div>

            {/* Spec sheet — continues below on desktop, sits under photo on mobile is skipped since it's here */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-14 border-t hidden md:block"
              style={{ borderColor: "var(--rule)" }}
            >
              {SPECS.map(row => (
                <div
                  key={row.k}
                  className="flex items-baseline justify-between py-3 border-b max-w-[420px]"
                  style={{ borderColor: "var(--rule)" }}
                >
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {row.k}
                  </span>
                  <span className="text-[13px] font-medium">{row.v}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — the photographic plate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative md:-mt-4"
          >
            <div className="relative">
              {/* Registration-mark frame, offset behind the photo — a print convention, not a shadowed card */}
              <div
                className="absolute -top-3 -right-3 bottom-3 left-3 border pointer-events-none hidden sm:block"
                style={{ borderColor: "var(--rule)" }}
              />
              <div
                className="relative overflow-hidden border"
                style={{ aspectRatio: "4/5", borderColor: "var(--rule)" }}
              >
               <img
  src={hero?.profileImageUrl || "https://via.placeholder.com/480x600"}
  alt={hero?.name || "Portrait"}
  className="h-full w-full object-cover object-top"
/>
              </div>
            </div>

            {/* Editorial caption — like a photo credit line */}
            <div className="mt-3 flex items-baseline justify-between">
              <span
                className="text-[11px] italic"
                style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}
              >
                {hero?.name || "James Patrick"} — Lucena City, {new Date().getFullYear()}
              </span>
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--muted-foreground)" }}
              >
                fig. 01
              </span>
            </div>
          </motion.div>
        </div>
        {/* Mobile spec sheet — shown under photo since desktop version is hidden on small screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 border-t md:hidden"
          style={{ borderColor: "var(--rule)" }}
        >
          {SPECS.map(row => (
            <div
              key={row.k}
              className="flex items-baseline justify-between py-3 border-b"
              style={{ borderColor: "var(--rule)" }}
            >
              <span
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                {row.k}
              </span>
              <span className="text-[13px] font-medium">{row.v}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}