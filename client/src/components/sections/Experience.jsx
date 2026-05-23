import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { useExperiences } from "../../hooks/useExperiences";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Helper — formats a date like "Jun 2023"
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function Experience() {
  const { data: experiences = [], isLoading } = useExperiences();

  if (isLoading)
    return (
      <section className="py-24 bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </section>
    );

  return (
    <section id="experience" className="py-24 bg-gray-950">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p className="text-blue-400 text-sm font-mono tracking-widest uppercase mb-3">
            Where I've Been
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Work Experience</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            My professional journey so far.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line running down the left side */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />

          <div className="flex flex-col gap-10">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="relative pl-14"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                // each entry delays slightly based on its position
                transition={{ delay: index * 0.1 }}
              >
                {/* Circle on the timeline line */}
                <div
                  className={`
                  absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center
                  ${
                    exp.isCurrent
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-gray-900"
                  }
                `}
                >
                  <Briefcase
                    size={14}
                    className={exp.isCurrent ? "text-blue-400" : "text-gray-500"}
                  />
                </div>

                {/* Card */}
                <div className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-colors duration-300">
                  {/* Top row — role + current badge */}
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-semibold text-white">{exp.role}</h3>
                    {exp.isCurrent && (
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                        {/* Pulsing dot for current role */}
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                        </span>
                        Current
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  <p className="text-blue-400 text-sm font-medium mb-3">{exp.company}</p>

                  {/* Date range */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <Calendar size={12} />
                    <span>
                      {formatDate(exp.startDate)} —{" "}
                      {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
