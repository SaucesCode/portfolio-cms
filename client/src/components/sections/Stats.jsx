import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CountUp } from "countup.js";
import { useStats } from "../../hooks/useStats";
import { Calendar, FolderKanban, Users, Award } from "lucide-react";

const iconMap = {
  Years: Calendar,
  Projects: FolderKanban,
  Clients: Users,
  Delivered: Award,
};

function StatCard({ stat }) {
  const countRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const Icon = iconMap[stat.label] || Calendar;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !hasAnimated) {
          const countUp = new CountUp(countRef.current, stat.value, {
            duration: 2,
            useEasing: true,
          });
          countUp.start();
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [stat.value, hasAnimated]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center p-8 bg-card/50 border border-border rounded-2xl hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="mb-5 p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform">
        <Icon size={28} strokeWidth={1.9} />
      </div>

      <span
        ref={countRef}
        className="text-4xl md:text-5xl font-black tracking-[-0.04em] text-foreground tabular-nums"
      >
        0
      </span>

      <span className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground text-center">
        {stat.label}
      </span>
    </motion.div>
  );
}

export default function Stats() {
  const { data: stats = [], isLoading } = useStats();

  if (isLoading || stats.length === 0) return null;

  return (
    <section className="relative py-20 bg-background border-y border-border overflow-hidden">
      {/* Subtle background elements matching Hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header - matching Hero style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-3">
            <div className="h-px w-6 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              TRACK RECORD
            </span>
            <div className="h-px w-6 bg-border" />
          </div>
          <h2
            className="font-black tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            By the Numbers
          </h2>
        </motion.div>

        {/* Stats Grid - Compact & Consistent */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <StatCard stat={stat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
