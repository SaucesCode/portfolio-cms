import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStats } from "../../hooks/useStats";
import { Calendar, FolderKanban, Users, Award } from "lucide-react";

const iconMap = {
  Years: Calendar,
  "Years Coding": Calendar,
  Projects: FolderKanban,
  "Projects Built": FolderKanban,
  Clients: Users,
  "Clients Served": Users,
  Delivered: Award,
};

function StatCell({ stat, index }) {
  const numRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const Icon = iconMap[stat.label] || Award;

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
          obs.disconnect();
          const target = stat.value;
          const duration = 1600;
          const start = performance.now();
          const step = now => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target);
            if (p < 1) requestAnimationFrame(step);
          };
          setTimeout(() => requestAnimationFrame(step), index * 120);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [stat.value, animated, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between gap-6 bg-card p-8 transition-colors duration-200 hover:bg-blue-600/[0.03]"
    >
      {/* Top accent line — fills on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-none">
        <div className="h-full w-full bg-border" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400" />
      </div>

      {/* Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/8 text-blue-600 dark:text-blue-400">
        <Icon size={16} strokeWidth={1.8} />
      </div>

      {/* Number block */}
      <div>
        <div className="flex items-end gap-1 leading-none mb-3">
          <span
            ref={numRef}
            className="font-black tracking-[-0.05em] tabular-nums text-foreground"
            style={{ fontSize: "clamp(44px, 5vw, 64px)" }}
          >
            0
          </span>
          {stat.value > 5 && (
            <span
              className="font-black text-blue-600 dark:text-blue-500 mb-1"
              style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
            >
              +
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50">
            {stat.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const { data: stats = [], isLoading } = useStats();

  if (isLoading || stats.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-background border-y border-border">
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
      {/* Grid dark */}
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

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-14 py-20">
        {/* Header — left aligned, matches system */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-border inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              Track Record
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
              BY THE
            </span>
            <span className="text-foreground">NUMBERS</span>
            <span className="text-blue-600 dark:text-blue-500">.</span>
          </div>
        </motion.div>

        {/* Stat cells — divided panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-border overflow-hidden rounded-2xl border border-border md:divide-y-0">
          {stats.map((stat, i) => (
            <StatCell key={stat.id} stat={stat} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-5 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/25"
        >
          Updated {new Date().getFullYear()}
        </motion.p>
      </div>
    </section>
  );
}
