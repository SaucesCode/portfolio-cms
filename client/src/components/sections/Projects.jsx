import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useProjects } from "../../hooks/useProjects";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ProjectCard({ project, onClick }) {
  return (
    <motion.div
      onClick={() => onClick(project)}
      whileHover={{ y: -6 }}
      className="group bg-card border border-border rounded-3xl overflow-hidden cursor-pointer hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">
            💻
          </div>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-[17px] tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors line-clamp-2">
            {project.title}
          </h3>
          {project.featured && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20 whitespace-nowrap">
              Featured
            </span>
          )}
        </div>

        <p className="text-muted-foreground text-[14px] leading-relaxed line-clamp-3 mb-6 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.techStack?.slice(0, 4).map((tech, i) => (
            <span
              key={i}
              className="text-[10px] px-3 py-1 bg-muted border border-border rounded-full text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-6 pt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          {project.stars !== null && (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500" />
              {project.stars}
            </span>
          )}
        </div>

        <div className="flex gap-3 text-muted-foreground">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="hover:text-foreground transition-colors"
            >
              <FaGithub size={17} />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="hover:text-foreground transition-colors"
            >
              <ExternalLink size={17} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  const allTags = ["All", ...new Set(projects.flatMap(p => p.techStack || []))];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter(p => p.techStack?.includes(activeFilter));

  if (isLoading) {
    return (
      <section className="py-20 bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="relative py-20 bg-background border-y border-border overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-3">
            <div className="h-px w-6 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              PORTFOLIO
            </span>
            <div className="h-px w-6 bg-border" />
          </div>
          <h2
            className="font-black tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(32px, 5vw, 46px)" }}
          >
            Featured Projects
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-[14.5px]">
            Real projects with clean architecture and great user experiences
          </p>
        </motion.div>

        {/* Improved Filter Design */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-6 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 border
                ${
                  activeFilter === tag
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                    : "border-border bg-card hover:border-blue-500/50 hover:text-foreground text-muted-foreground"
                }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} onClick={setSelectedProject} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal remains the same */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-auto"
                onClick={e => e.stopPropagation()}
              >
                {selectedProject.imageUrl && (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full aspect-video object-cover rounded-t-3xl"
                  />
                )}

                <div className="p-8">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="float-right -mt-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={26} />
                  </button>

                  <h2 className="text-3xl font-black tracking-tight mb-5">
                    {selectedProject.title}
                  </h2>

                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {selectedProject.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedProject.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-4 py-1.5 text-sm bg-muted border border-border rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 border border-border hover:bg-muted rounded-2xl flex items-center justify-center gap-3 font-medium"
                      >
                        <FaGithub size={19} /> View Code
                      </a>
                    )}
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 font-medium"
                      >
                        <ExternalLink size={19} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
