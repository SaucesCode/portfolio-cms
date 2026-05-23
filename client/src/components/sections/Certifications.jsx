import { motion } from "framer-motion";
import { Award, ExternalLink, Calendar } from "lucide-react";
import { useCertifications } from "../../hooks/useCertifications";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function Certifications() {
  const { data: certifications = [], isLoading } = useCertifications();

  // Don't render the section at all if there's nothing to show
  if (isLoading || certifications.length === 0) return null;

  return (
    <section id="certifications" className="py-24 bg-gray-950">
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
            Credentials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Certifications</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Courses and certifications I've completed.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {certifications.map(cert => (
            <motion.a
              key={cert.id}
              variants={cardVariants}
              href={cert.credentialUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              // Only show pointer cursor if there's a link
              className={`group relative flex flex-col gap-4 p-6 rounded-2xl bg-gray-900 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5
                ${cert.credentialUrl ? "cursor-pointer" : "cursor-default"}`}
            >
              {/* Top row — icon + external link indicator */}
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Award size={18} className="text-blue-400" />
                </div>
                {cert.credentialUrl && (
                  <ExternalLink
                    size={14}
                    className="text-gray-600 group-hover:text-blue-400 transition-colors"
                  />
                )}
              </div>

              {/* Cert name */}
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1 leading-snug">
                  {cert.name}
                </h3>

                {/* Issuer */}
                <p className="text-sm text-gray-400">{cert.issuer}</p>
              </div>

              {/* Issue date */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto">
                <Calendar size={11} />
                <span>Issued {formatDate(cert.issueDate)}</span>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/3 transition-colors duration-300" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
