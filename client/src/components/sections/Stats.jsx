import { useRef, useEffect, useState, Fragment } from "react";
import { motion } from "framer-motion";
import { useStats } from "../../hooks/useStats";

function useCountUp(target, shouldStart, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let raf;
    const timeout = setTimeout(() => {
      const duration = 1500;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [shouldStart, target, delay]);
  return value;
}

function StatNumber({ stat, index, animate }) {
  const count = useCountUp(stat.value, animate, index * 150);
  return (
    <span className="inline-flex items-baseline whitespace-nowrap mx-1.5">
      <span
        className="font-black tracking-[-0.03em] tabular-nums"
        style={{ fontSize: "clamp(34px, 4.6vw, 58px)", lineHeight: 1, color: "var(--signal)" }}
      >
        {count}
        {stat.value >= 10 && "+"}
      </span>
      <span className="ml-2 font-medium" style={{ fontSize: "clamp(15px, 1.6vw, 19px)", color: "var(--muted-foreground)" }}>
        {stat.label.toLowerCase()}
      </span>
    </span>
  );
}

export default function Stats() {
  const { data: stats = [], isLoading } = useStats();
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (isLoading || stats.length === 0) return null;

  return (
    <section id="stats" ref={ref} className="border-t" style={{ background: "var(--background)", borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-[900px] px-6 py-28 md:py-40">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mono-label text-[11px] mb-16 text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          0002 — looking back
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
          style={{
            fontSize: "clamp(19px, 2.3vw, 24px)",
            lineHeight: 2.15,
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          None of this happened overnight. Between the late nights and the quiet ones, it's
          slowly become
          {stats.map((stat, i) => (
            <Fragment key={stat.id}>
              {i > 0 && i === stats.length - 1 ? " and" : i > 0 ? "," : ""}
              <StatNumber stat={stat} index={i} animate={inView} />
            </Fragment>
          ))}
          — and however this reads to you, I'm not done yet.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center text-[13px] italic"
          style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}
        >
          If any of this is worth continuing together —
        </motion.p>
      </div>
    </section>
  );
}