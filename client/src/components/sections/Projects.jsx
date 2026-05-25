import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, GitFork, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useProjects } from "../../hooks/useProjects";

/* ── Project Card ────────────────────────────────────────────── */
function ProjectCard({ project, index, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(project)}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "16/10" }}>
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/8 to-violet-600/4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/20">
              {project.language || "Project"}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {project.featured && (
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
              Featured
            </span>
          )}
        </div>

        {/* Quick links — appear on hover */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/90 border border-border text-foreground hover:bg-background backdrop-blur-sm transition-colors"
            >
              <FaGithub size={12} />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <h3 className="mb-1.5 text-[15px] font-black tracking-tight leading-snug text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {project.title}
        </h3>

        {/* Description */}
        <p className="mb-4 flex-1 text-[12.5px] leading-relaxed text-muted-foreground/70 line-clamp-2">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack?.slice(0, 3).map((tech, i) => (
            <span
              key={i}
              className="rounded-md border border-border bg-muted/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60"
            >
              {tech}
            </span>
          ))}
          {project.techStack?.length > 3 && (
            <span className="rounded-md border border-border bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground/35">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
          {project.stars != null && (
            <span className="flex items-center gap-1">
              <Star size={10} className="text-yellow-500/80" />
              {project.stars}
            </span>
          )}
          {project.forks != null && (
            <span className="flex items-center gap-1">
              <GitFork size={10} />
              {project.forks}
            </span>
          )}
          {project.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500/70" />
              {project.language}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/25 group-hover:text-blue-500 transition-colors">
          View details →
        </span>
      </div>

      {/* Bottom blue line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  );
}

/* ── Detail Modal ────────────────────────────────────────────── */
function ProjectModal({ project, onClose }) {
  if (!project) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg rounded-2xl border border-border bg-background overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Image */}
          {project.imageUrl && (
            <div className="relative h-52 overflow-hidden bg-muted">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          )}

          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground hover:text-foreground backdrop-blur-sm transition-colors"
            >
              <X size={13} />
            </button>

            <div className="mb-2 flex items-center gap-2 flex-wrap">
              {project.featured && (
                <span className="rounded-full bg-blue-600/10 border border-blue-600/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                  Featured
                </span>
              )}
              {project.language && (
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {project.language}
                </span>
              )}
              <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground/40">
                {project.stars != null && (
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-500" />
                    {project.stars}
                  </span>
                )}
                {project.forks != null && (
                  <span className="flex items-center gap-1">
                    <GitFork size={11} />
                    {project.forks}
                  </span>
                )}
              </div>
            </div>

            <h2 className="mb-3 text-[22px] font-black tracking-[-0.03em] text-foreground">
              {project.title}
            </h2>
            <p className="mb-5 text-[13.5px] leading-[1.75] text-muted-foreground">
              {project.description}
            </p>

            <div className="mb-6">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground/40">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack?.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-blue-500/15 bg-blue-500/6 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-muted py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-foreground hover:bg-muted/60 transition-colors"
                >
                  <FaGithub size={14} /> Code
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors shadow-lg shadow-blue-600/20"
                >
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  const allTags = ["All", ...new Set(projects.flatMap(p => p.techStack || []))];

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter(p => p.techStack?.includes(activeFilter));

  if (isLoading)
    return (
      <section className="flex items-center justify-center py-24 bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </section>
    );

  return (
    <>
      <section
        id="projects"
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
        {/* Grid dark */}
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
        <div className="pointer-events-none absolute top-0 right-0 z-0 h-[400px] w-[400px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-14 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-6 bg-border inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                Portfolio
              </span>
            </div>

            <div
              className="mb-2 flex flex-wrap items-end gap-x-4 leading-[0.9] tracking-[-0.04em] font-black"
              style={{ fontSize: "clamp(40px, 7vw, 80px)" }}
            >
              <span
                className="text-transparent select-none"
                style={{
                  WebkitTextStroke:
                    "1.5px color-mix(in srgb, var(--foreground) 22%, transparent)",
                }}
              >
                SELECTED
              </span>
              <span className="text-foreground">WORK</span>
              <span className="text-blue-600 dark:text-blue-500">.</span>
            </div>

            <p className="mt-4 max-w-[480px] text-[13.5px] leading-relaxed text-muted-foreground/60">
              A selection of projects I've built — from quick prototypes to production systems.
            </p>

            {/* Filter strip */}
            <div className="mt-10 flex items-end gap-0 border-b border-border overflow-x-auto no-scrollbar">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`relative shrink-0 pb-3 pr-6 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-150
                    ${activeFilter === tag ? "text-foreground" : "text-muted-foreground/40 hover:text-foreground"}`}
                >
                  {tag}
                  {activeFilter === tag && (
                    <motion.div
                      layoutId="proj-underline"
                      className="absolute bottom-0 left-0 right-6 h-[2px] rounded-full bg-blue-600"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Cards grid */}
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onClick={setSelectedProject}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-[13px] text-muted-foreground/40"
            >
              No projects match this filter.
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-right text-[11px] text-muted-foreground/25 font-medium uppercase tracking-[0.1em]"
          >
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </motion.div>
        </div>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
