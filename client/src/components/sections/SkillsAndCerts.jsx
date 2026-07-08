import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, Calendar } from "lucide-react";
import { useSkills } from "../../hooks/useSkills";
import { useCertifications } from "../../hooks/useCertifications";

const CATEGORY_ORDER = ["Frontend", "Backend", "Tools", "Other"];

// Proficiency drives literal type weight — a variable font lets us hit these exactly
const WEIGHT_MAP = { 1: 400, 2: 500, 3: 650, 4: 780, 5: 900 };
const SIZE_MAP = { 1: 20, 2: 26, 3: 33, 4: 40, 5: 48 };

function SkillWord({ skill, index }) {
  const [hovered, setHovered] = useState(false);
  const weight = WEIGHT_MAP[skill.proficiencyLevel] || 500;
  const size = SIZE_MAP[skill.proficiencyLevel] || 26;

  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.025, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${skill.name} — proficiency ${skill.proficiencyLevel} of 5`}
      className="group inline-flex items-baseline gap-2 mr-5 mb-1 rounded-sm focus-visible:outline-none focus-visible:ring-2"
      style={{ "--tw-ring-color": "var(--signal)" }}
    >
      <span
        className="tracking-[-0.02em] transition-colors duration-200"
        style={{
          fontSize: `${size}px`,
          fontWeight: weight,
          lineHeight: 1.15,
          color: hovered ? "var(--signal)" : "var(--foreground)",
        }}
      >
        {skill.name}
      </span>
      <span
        className="mono-label text-[10px] transition-all duration-200"
        style={{
          color: "var(--muted-foreground)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-3px)",
        }}
      >
        {skill.proficiencyLevel}/5
      </span>
    </motion.button>
  );
}

function SkillsTab({ skills }) {
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = skills.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  const categories = Object.keys(grouped);
  const [active, setActive] = useState(categories[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10 md:gap-16">
      {/* Left rail — category index, desktop */}
      <div className="hidden md:flex flex-col gap-1 sticky top-24 self-start">
        {categories.map(cat => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="group flex items-center justify-between py-2.5 text-left border-b transition-colors"
              style={{ borderColor: "var(--rule)" }}
            >
              <span
                className="text-[13px] font-medium transition-colors"
                style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                {cat}
              </span>
              <span
                className="mono-label text-[10px]"
                style={{ color: isActive ? "var(--signal)" : "var(--muted-foreground)" }}
              >
                {String(grouped[cat].length).padStart(2, "0")}
              </span>
            </button>
          );
        })}
        <p
          className="mono-label text-[10px] leading-relaxed mt-6 max-w-[160px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Larger, bolder type — more time spent with it.
        </p>
      </div>

      {/* Mobile — horizontal tabs */}
      <div
        className="flex md:hidden gap-6 overflow-x-auto pb-3 border-b no-scrollbar"
        style={{ borderColor: "var(--rule)" }}
      >
        {categories.map(cat => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="relative pb-2 shrink-0 text-[12px] font-mono uppercase tracking-wider"
              style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              {cat}
              {isActive && (
                <motion.span
                  layoutId="skills-mobile-underline"
                  className="absolute left-0 right-0 -bottom-[13px] h-[2px]"
                  style={{ background: "var(--signal)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right — the typographic word field */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.02 } } }}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="flex flex-wrap items-baseline pt-1"
          >
            {grouped[active]?.map((skill, i) => (
              <SkillWord key={skill.id} skill={skill} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── CertsTab — badge-led rows, editorial not card-grid ───────── */
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function CertBadge({ cert }) {
  const [errored, setErrored] = useState(false);
  const hasImage = cert.badgeImageUrl && !errored;

  return (
    <div
      className="relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5"
      style={{
        width: 44,
        height: 44,
        background: "var(--muted)",
        border: "1px solid var(--rule)",
      }}
    >
      {hasImage ? (
        <img
          src={cert.badgeImageUrl}
          alt=""
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-contain p-1.5"
        />
      ) : (
        <Award size={16} style={{ color: "var(--muted-foreground)" }} />
      )}
    </div>
  );
}

function CertsTab({ certifications }) {
  return (
    <div className="flex flex-col">
      {certifications.map((cert, i) => (
        <motion.a
          key={cert.id}
          href={cert.credentialUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group flex items-center gap-4 py-5 border-b transition-colors"
          style={{
            borderColor: "var(--rule)",
            cursor: cert.credentialUrl ? "pointer" : "default",
          }}
        >
          {/* Badge — fixed box, object-contain so logos of any aspect ratio sit centered and uncropped */}
          <CertBadge cert={cert} />

          <div className="min-w-0 flex-1">
            <h3
              className="text-[15px] font-bold truncate transition-colors group-hover:opacity-80"
              style={{ color: "var(--foreground)" }}
            >
              {cert.name}
            </h3>
            <p className="mono-label text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {cert.issuer} · {formatDate(cert.issueDate)}
            </p>
          </div>

          {cert.credentialUrl && (
            <ExternalLink
              size={14}
              className="shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: "var(--muted-foreground)" }}
            />
          )}
        </motion.a>
      ))}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function SkillsAndCerts() {
  const { data: skills = [], isLoading: loadingSkills } = useSkills();
  const { data: certifications = [], isLoading: loadingCerts } = useCertifications();
  const [activeTab, setActiveTab] = useState("skills");

  if (loadingSkills || loadingCerts) return <section className="py-24" />;

  const TABS = [
    { id: "skills", label: "Skills", count: skills.length },
    { id: "certs", label: "Certifications", count: certifications.length },
  ];

  return (
    <section
      id="skills"
      className="border-t"
      style={{ background: "var(--background)", borderColor: "var(--rule)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-20 md:py-28">
        <div className="mb-14">
          <p
            className="mono-label text-[11px] mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            003 — capabilities
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2
              className="font-black tracking-[-0.03em] leading-[0.95]"
              style={{ fontSize: "clamp(36px, 5.5vw, 68px)" }}
            >
              What I <span className="accent-word">reach</span> for.
            </h2>
            <div className="flex items-center gap-6 pb-2">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative pb-2 text-[12px] font-mono uppercase tracking-wider"
                    style={{
                      color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {tab.label}{" "}
                    <span style={{ color: "var(--muted-foreground)" }}>({tab.count})</span>
                    {isActive && (
                      <motion.span
                        layoutId="skills-tab-underline"
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px]"
                        style={{ background: "var(--signal)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "skills" ? (
            <motion.div
              key="skills"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SkillsTab skills={skills} />
            </motion.div>
          ) : (
            <motion.div
              key="certs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CertsTab certifications={certifications} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
