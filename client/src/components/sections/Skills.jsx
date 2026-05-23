import { motion } from "framer-motion";
import { useSkills } from "../../hooks/useSkills";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08, // each skill card staggers in slightly after the previous
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Map category names to an emoji for visual grouping
const CATEGORY_ICONS = {
  Frontend: "🎨",
  Backend: "⚙️",
  Tools: "🛠️",
  Other: "📦",
};

export default function Skills() {
  const { data: skills = [], isLoading } = useSkills();

  // Group skills by category
  // Result looks like: { Frontend: [...], Backend: [...], Tools: [...] }
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  if (isLoading)
    return (
      <section className="py-24 bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </section>
    );

  return (
    <section id="skills" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p className="text-blue-400 text-sm font-mono tracking-widest uppercase mb-3">
            What I Know
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Skills & Technologies
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Technologies I work with day to day.
          </p>
        </motion.div>

        {/* One block per category */}
        <div className="flex flex-col gap-12">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category}>
              {/* Category label */}
              <motion.div
                className="flex items-center gap-3 mb-6"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <span className="text-lg">{CATEGORY_ICONS[category] || "📦"}</span>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                  {category}
                </h3>
                {/* Horizontal line after label */}
                <div className="flex-1 h-px bg-white/5" />
              </motion.div>

              {/* Skills grid for this category */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {categorySkills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Separate component so hover state is isolated per card
function SkillCard({ skill }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-900 border border-white/5 hover:border-blue-500/30 hover:bg-gray-800/50 transition-all duration-300 cursor-default"
    >
      {/* Skill name */}
      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors text-center">
        {skill.name}
      </span>

      {/* Proficiency dots — hidden by default, visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {[1, 2, 3, 4, 5].map(level => (
          <div
            key={level}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              level <= skill.proficiencyLevel ? "bg-blue-400" : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/3 transition-colors duration-300" />
    </motion.div>
  );
}
