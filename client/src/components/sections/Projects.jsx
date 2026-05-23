import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, GitFork, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useProjects } from "../../hooks/useProjects";

// Reusable fade-up animation for section headings
// We'll reuse this pattern in every section
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  // Build filter list dynamically from all tech stacks in your projects
  // Set removes duplicates, spread converts it back to array
  const allTags = ["All", ...new Set(projects.flatMap(p => p.techStack))];

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter(p => p.techStack.includes(activeFilter));

  if (isLoading)
    return (
      <section className="py-24 bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </section>
    );

  return (
    <section id="projects" className="py-24 bg-gray-950">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }} // only animates once when scrolled into view
        >
          <p className="text-blue-400 text-sm font-mono tracking-widest uppercase mb-3">
            My Work
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Projects</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Things I've built — from side projects to client work.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeFilter === tag
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "border border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Project cards grid */}
        {/* layout prop on motion.div tells Framer Motion to animate
            layout changes smoothly when cards are filtered */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(project => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-gray-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                {/* Project image */}
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    // Placeholder when no image
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">
                        {project.language === "Python"
                          ? "🐍"
                          : project.language === "TypeScript"
                            ? "💙"
                            : "💻"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {/* Title + featured badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.slice(0, 4).map(tech => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Footer — stars, language, links */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {project.stars !== null && (
                        <span className="flex items-center gap-1">
                          <Star size={12} />
                          {project.stars}
                        </span>
                      )}
                      {project.forks !== null && (
                        <span className="flex items-center gap-1">
                          <GitFork size={12} />
                          {project.forks}
                        </span>
                      )}
                      {project.language && (
                        <span className="text-gray-500">{project.language}</span>
                      )}
                    </div>

                    {/* Links — stop propagation so clicking links
                        doesn't also open the modal */}
                    <div className="flex gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        >
                          <FaGithub size={14} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="bg-gray-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 relative"
                onClick={e => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>

                <h2 className="text-xl font-bold text-white mb-2">{selectedProject.title}</h2>

                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {selectedProject.description}
                </p>

                {/* Full tech stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.techStack.map(tech => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-400 mb-6">
                  {selectedProject.stars !== null && (
                    <span className="flex items-center gap-1.5">
                      <Star size={14} className="text-yellow-400" />
                      {selectedProject.stars} stars
                    </span>
                  )}
                  {selectedProject.forks !== null && (
                    <span className="flex items-center gap-1.5">
                      <GitFork size={14} />
                      {selectedProject.forks} forks
                    </span>
                  )}
                  {selectedProject.language && <span>{selectedProject.language}</span>}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg text-sm transition-all hover:bg-white/5"
                    >
                      <Github size={15} />
                      View Code
                    </a>
                  )}
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-all"
                    >
                      <ExternalLink size={15} />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
