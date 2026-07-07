import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useHero } from "../../hooks/useHero";

function useManilaTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Footer() {
  const { data: hero } = useHero();
  const time = useManilaTime();
  const year = new Date().getFullYear();

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t" style={{ background: "var(--background)", borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-16 md:py-20">
        {/* The line — the one memorable statement, set large and italic */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="tracking-[-0.02em] leading-[1.1] mb-14"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(24px, 3.6vw, 40px)",
            color: "var(--foreground)",
            maxWidth: "720px",
          }}
        >
          Thanks for reading this far — it means you actually looked, not just scrolled.
        </motion.p>

        {/* The colophon strip */}
        <div
          className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pt-8 border-t"
          style={{ borderColor: "var(--rule)" }}
        >
          <p className="mono-label text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            © {year} {hero?.name || "James Patrick De Mesa"} — designed &amp; built by hand, in Lucena City
          </p>

          <div className="flex items-center gap-6">
            <span className="mono-label text-[11px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
              mnl {time}
            </span>
            <button
              onClick={scrollTop}
              aria-label="Back to top"
              className="group flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              Back to top
              <ArrowUp size={12} className="transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}