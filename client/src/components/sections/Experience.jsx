import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useExperiences } from "../../hooks/useExperiences";

function formatDate(dateStr, opts = {}) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: opts.short ? "short" : "long",
    year: "numeric",
  });
}

function duration(start, end, isCurrent) {
  const from = new Date(start);
  const to = isCurrent ? new Date() : new Date(end);
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (months < 12) return `${months} mo`;
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  return mo ? `${yrs} yr ${mo} mo` : `${yrs} yr`;
}

/* ── The lead story — current role ──────────────────────────── */
function NowBlock({ exp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="pb-14 mb-14 border-b"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="flex items-center gap-2.5 mb-6">
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
        <span
          className="mono-label text-[11px] uppercase tracking-wider"
          style={{ color: "var(--signal-warm)" }}
        >
          Currently — {duration(exp.startDate, exp.endDate, true)} and counting
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 md:gap-16 items-start">
        <div>
          <h3
            className="font-black tracking-[-0.03em] leading-[0.98]"
            style={{ fontSize: "clamp(34px, 5vw, 58px)" }}
          >
            {exp.role}
          </h3>
          <p
            className="mt-3 text-[18px] md:text-[20px]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--signal)",
            }}
          >
            {exp.company}
          </p>
        </div>

        <div className="md:pt-2">
          <p
            className="text-[14px] leading-[1.85]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {exp.description}
          </p>
          <p
            className="mono-label text-[11px] mt-5"
            style={{ color: "var(--muted-foreground)" }}
          >
            since {formatDate(exp.startDate)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── One line in the record ─────────────────────────────────── */
function RecordRow({ exp, index, total, isOpen, onToggle }) {
  // Recede visually the further back in history — recency expressed as scale, not a dot on a line
  const recede = index / Math.max(total - 1, 1); // 0 = most recent past role, 1 = oldest
  const titleSize = 22 - recede * 5; // 22px → ~17px
  const fade = 1 - recede * 0.35;

  return (
    <div className="border-b" style={{ borderColor: "var(--rule)" }}>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={onToggle}
        className="group w-full flex items-baseline justify-between gap-6 py-5 text-left"
        style={{ opacity: fade }}
      >
        <div className="flex items-baseline gap-4 min-w-0">
          <span
            className="mono-label text-[10px] shrink-0"
            style={{ color: "var(--muted-foreground)" }}
          >
            {String(total - index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span
              className="font-bold tracking-[-0.01em] transition-colors"
              style={{
                fontSize: `${titleSize}px`,
                color: isOpen ? "var(--signal)" : "var(--foreground)",
              }}
            >
              {exp.role}
            </span>
            <span className="ml-2 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              — {exp.company}
            </span>
          </div>
        </div>
        <span
          className="mono-label text-[11px] shrink-0 whitespace-nowrap"
          style={{ color: "var(--muted-foreground)" }}
        >
          {formatDate(exp.startDate, { short: true })} –{" "}
          {formatDate(exp.endDate, { short: true })}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p
              className="pb-6 pl-8 max-w-[560px] text-[13px] leading-[1.8]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {exp.description}
              <span
                className="mono-label block mt-2 text-[11px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {duration(exp.startDate, exp.endDate, false)}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Experience() {
  const { data: experiences = [], isLoading } = useExperiences();
  const [openId, setOpenId] = useState(null);

  if (isLoading) return <section id="experience" className="py-24" />;

  const current = experiences.find(e => e.isCurrent);
  const past = experiences.filter(e => !e.isCurrent);

  return (
    <section
      id="experience"
      className="border-t"
      style={{ background: "var(--background)", borderColor: "var(--rule)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-20 md:py-28">
        <div className="mb-14">
          <p
            className="mono-label text-[11px] mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            004 — trajectory
          </p>
          <h2
            className="font-black tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: "clamp(36px, 5.5vw, 68px)" }}
          >
            Where I am <span className="accent-word">now</span>.
          </h2>
        </div>

        {current && <NowBlock exp={current} />}

        {past.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p
                className="mono-label text-[11px] uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                Before that
              </p>
              <p
                className="mono-label text-[11px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {past.length} role{past.length !== 1 ? "s" : ""}
              </p>
            </div>
            {past.map((exp, i) => (
              <RecordRow
                key={exp.id}
                exp={exp}
                index={i}
                total={past.length}
                isOpen={openId === exp.id}
                onToggle={() => setOpenId(prev => (prev === exp.id ? null : exp.id))}
              />
            ))}
          </div>
        )}

        {!current && past.length === 0 && (
          <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            No experience logged yet.
          </p>
        )}
      </div>
    </section>
  );
}
