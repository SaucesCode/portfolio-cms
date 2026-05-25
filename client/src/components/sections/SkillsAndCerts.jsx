import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, Calendar, ChevronRight } from "lucide-react";
import { useSkills } from "../../hooks/useSkills";
import { useCertifications } from "../../hooks/useCertifications";

/* ── constants ───────────────────────────────────────────────── */
const CATEGORY_ORDER = ["Frontend", "Backend", "Tools", "Other"];

const CATEGORY_META = {
  Frontend: {
    accent: "text-blue-500",
    bg: "bg-blue-500/8",
    border: "border-blue-500/15",
    num: "01",
  },
  Backend: {
    accent: "text-violet-500",
    bg: "bg-violet-500/8",
    border: "border-violet-500/15",
    num: "02",
  },
  Tools: {
    accent: "text-emerald-500",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
    num: "03",
  },
  Other: {
    accent: "text-amber-500",
    bg: "bg-amber-500/8",
    border: "border-amber-500/15",
    num: "04",
  },
};

/* ── helpers ─────────────────────────────────────────────────── */
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/* ── SkillTag ────────────────────────────────────────────────── */
function SkillTag({ skill, accent, bg, border }) {
  const pct = (skill.proficiencyLevel / 5) * 100;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } }}
      transition={{ duration: 0.25 }}
      className={`group relative overflow-hidden rounded-xl border ${border} ${bg} px-3.5 py-2.5 cursor-default`}
    >
      <span className={`block text-[12px] font-semibold ${accent} leading-none mb-2`}>
        {skill.name}
      </span>
      {/* Proficiency bar */}
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className={`h-full rounded-full ${accent.replace("text-", "bg-")}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {/* Level label — appears on hover */}
      <span
        className={`absolute right-2 top-2 text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity ${accent}`}
      >
        {skill.proficiencyLevel}/5
      </span>
    </motion.div>
  );
}

/* ── SkillsTab ───────────────────────────────────────────────── */
function SkillsTab({ skills }) {
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = skills.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-0 divide-y divide-border">
      {Object.entries(grouped).map(([category, items], idx) => {
        const meta = CATEGORY_META[category] ?? CATEGORY_META.Other;
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: idx * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="py-8 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 md:gap-10 items-start"
          >
            {/* Category label column */}
            <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-2 md:pt-1">
              <span
                className={`text-[10px] font-black opacity-20 select-none`}
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {meta.num}
              </span>
              <div>
                <span
                  className={`block text-[11px] font-black uppercase tracking-[0.14em] ${meta.accent}`}
                >
                  {category}
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-medium">
                  {items.length} {items.length === 1 ? "skill" : "skills"}
                </span>
              </div>
            </div>

            {/* Skills grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              {items.map(skill => (
                <SkillTag
                  key={skill.id}
                  skill={skill}
                  accent={meta.accent}
                  bg={meta.bg}
                  border={meta.border}
                />
              ))}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── CertsTab ────────────────────────────────────────────────── */
function CertsTab({ certifications }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.map((cert, i) => (
        <motion.a
          key={cert.id}
          href={cert.credentialUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`group relative flex flex-col gap-0 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-600/5 ${cert.credentialUrl ? "cursor-pointer" : "cursor-default"}`}
        >
          {/* Colored top strip */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-violet-600 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="flex flex-col gap-4 p-5">
            {/* Icon row */}
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/8 border border-blue-500/15">
                <Award size={18} className="text-blue-500" strokeWidth={1.8} />
              </div>
              {cert.credentialUrl && (
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/30 group-hover:text-blue-500 transition-colors">
                  View
                  <ExternalLink size={10} />
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <h3 className="text-[14px] font-bold leading-snug tracking-tight text-foreground mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {cert.name}
              </h3>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50">
                {cert.issuer}
              </p>
            </div>

            {/* Date */}
            <div className="mt-auto flex items-center gap-1.5 text-[11px] text-muted-foreground/35 pt-2 border-t border-border">
              <Calendar size={11} />
              Issued {formatDate(cert.issueDate)}
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function SkillsAndCerts() {
  const { data: skills = [], isLoading: loadingSkills } = useSkills();
  const { data: certifications = [], isLoading: loadingCerts } = useCertifications();
  const [activeTab, setActiveTab] = useState("skills");

  if (loadingSkills || loadingCerts)
    return (
      <section className="flex items-center justify-center py-24 bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </section>
    );

  const TABS = [
    { id: "skills", label: "Skills", count: skills.length },
    { id: "certs", label: "Certifications", count: certifications.length },
  ];

  return (
    <section
      id="skills"
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
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%,#000 50%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 40%,#000 50%,transparent 100%)",
        }}
      />

      {/* Blue glow */}
      <div className="pointer-events-none absolute top-0 right-0 z-0 h-[400px] w-[400px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-14 py-20">
        {/* ── Section header ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          {/* Eyebrow */}
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-border inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              Expertise
            </span>
          </div>

          {/* Split headline — matches hero style */}
          <div
            className="flex flex-wrap items-end gap-x-4 gap-y-0 leading-[0.9] tracking-[-0.04em] font-black"
            style={{ fontSize: "clamp(40px, 7vw, 80px)" }}
          >
            <span
              className="text-transparent select-none"
              style={{
                WebkitTextStroke:
                  "1.5px color-mix(in srgb, var(--foreground) 22%, transparent)",
              }}
            >
              SKILLS
            </span>
            <span className="text-foreground">&</span>
            <span className="text-blue-600 dark:text-blue-500">CREDENTIALS</span>
          </div>

          {/* Tab switcher — underline style */}
          <div className="mt-10 flex items-end gap-0 border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 pb-3 pr-8 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                    activeTab === tab.id
                      ? "bg-blue-600/10 text-blue-600 dark:text-blue-500"
                      : "bg-muted text-muted-foreground/40"
                  }`}
                >
                  {tab.count}
                </span>
                {/* Underline indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-8 h-[2px] rounded-full bg-blue-600"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Tab content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "skills" ? (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <SkillsTab skills={skills} />
            </motion.div>
          ) : (
            <motion.div
              key="certs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <CertsTab certifications={certifications} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
