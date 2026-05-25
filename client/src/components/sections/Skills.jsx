import { motion } from "framer-motion";
import { useSkills } from "../../hooks/useSkills";

const CATEGORY_ORDER = ["Frontend", "Backend", "Tools", "Other"];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function SkillCard({ skill }) {
  const fillPercent = skill.proficiencyLevel / 5;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * fillPercent;

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-4 transition-all duration-200 hover:border-blue-500/25 hover:bg-blue-600/[0.03] cursor-default overflow-hidden"
    >
      {/* Arc gauge — visible on hover */}
      <div className="relative flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg width="36" height="36" className="-rotate-90">
          {/* Track */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          {/* Fill */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className="text-blue-500 transition-all duration-700"
          />
        </svg>
        {/* Level number in center */}
        <span className="absolute text-[10px] font-black text-blue-500 rotate-90">
          {skill.proficiencyLevel}
        </span>
      </div>

      <span className="text-[12px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
        {skill.name}
      </span>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden rounded-b-xl">
        <div
          className="h-full bg-blue-600/30 group-hover:bg-blue-600 transition-colors duration-300"
          style={{ width: `${fillPercent * 100}%` }}
        />
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const { data: skills = [], isLoading } = useSkills();

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = skills.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  if (isLoading)
    return (
      <section className="flex items-center justify-center py-20 bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </section>
    );

  return (
    <section
      id="skills"
      className="relative overflow-hidden border-y border-border bg-background py-20"
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      {/* Grid lines */}
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

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <div className="mb-2 flex items-center justify-center gap-3">
            <div className="h-px w-6 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
              What I Know
            </span>
            <div className="h-px w-6 bg-border" />
          </div>
          <h2
            className="font-black tracking-[-0.04em]"
            style={{ fontSize: "clamp(28px, 4vw, 42px)" }}
          >
            <span
              className="text-transparent"
              style={{
                WebkitTextStroke:
                  "1.5px color-mix(in srgb, var(--foreground) 22%, transparent)",
              }}
            >
              SKILLS &{" "}
            </span>
            <span className="text-foreground">TECHNOLOGIES</span>
          </h2>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([category, categorySkills], catIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.07 }}
            >
              {/* Category label */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                  {category}
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground/30">
                  {categorySkills.length}
                </span>
              </div>

              {/* Skills grid */}
              <motion.div
                className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {categorySkills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
