import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Star, GitFork } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useProjects } from "../../hooks/useProjects";

function FilterTabs({ tags, active, onChange }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b pb-4"
      style={{ borderColor: "var(--rule)" }}
    >
      {tags.map(tag => {
        const isActive = active === tag;
        return (
          <button
            key={tag}
            onClick={() => onChange(tag)}
            className="relative pb-2 text-[12px] font-mono uppercase tracking-wider transition-colors"
            style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
          >
            {tag}
            {isActive && (
              <motion.span
                layoutId="project-filter-underline"
                className="absolute left-0 right-0 -bottom-[17px] h-[2px]"
                style={{ background: "var(--signal)" }}
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ProjectRow({ project, index, isHovered, isOpen, onHover, onToggle, onOpenDetail }) {
  return (
    <div className="border-b" style={{ borderColor: "var(--rule)" }}>
      <motion.button
        onMouseEnter={() => onHover(project.id)}
        // onClick={() => onToggle(project.id)}
        onClick={() => onOpenDetail(project)}
        className="group w-full flex items-start gap-5 py-6 text-left"
      >
        {/* Index number — real sequence: order shown in the list */}
        <span
          className="mono-label text-[11px] pt-2 shrink-0 w-6 transition-colors"
          style={{ color: isHovered ? "var(--signal)" : "var(--muted-foreground)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3
              className="font-black tracking-[-0.02em] leading-[1.1] transition-colors"
              style={{
                fontSize: "clamp(24px, 3.2vw, 38px)",
                color: isHovered ? "var(--signal)" : "var(--foreground)",
              }}
            >
              {project.title}
            </h3>
            <ArrowUpRight
              size={20}
              className="shrink-0 mt-2 transition-all duration-200"
              style={{
                color: isHovered ? "var(--signal)" : "var(--muted-foreground)",
                transform: isHovered ? "translate(3px,-3px)" : "translate(0,0)",
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {project.techStack?.slice(0, 4).map(tech => (
              <span
                key={tech}
                className="mono-label text-[11px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {tech}
              </span>
            ))}
            {project.featured && (
              <span
                className="flex items-center gap-1.5 text-[11px] font-mono"
                style={{ color: "var(--signal-warm)" }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: "var(--signal-warm)" }}
                />
                featured
              </span>
            )}
            {project.stars != null && (
              <span
                className="flex items-center gap-1 text-[11px] font-mono"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Star size={10} /> {project.stars}
              </span>
            )}
          </div>
        </div>
      </motion.button>

      {/* Mobile-only inline expand — desktop uses the sticky plate instead */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="pb-6 pl-11">
              {project.imageUrl && (
                <div
                  className="mb-4 overflow-hidden border"
                  style={{ borderColor: "var(--rule)", aspectRatio: "16/10" }}
                >
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <p
                className="text-[13.5px] leading-relaxed mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                {project.description}
              </p>
              <button
                onClick={() => onOpenDetail(project)}
                className="text-[12px] font-bold uppercase tracking-wider border-b-2 pb-0.5"
                style={{ borderColor: "var(--signal)" }}
              >
                Read more
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailPanel({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "color-mix(in oklch, var(--foreground) 30%, transparent)" }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[520px] overflow-y-auto border-l"
            style={{ background: "var(--background)", borderColor: "var(--rule)" }}
          >
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-10">
                <span
                  className="mono-label text-[11px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {project.language || "project"}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {project.imageUrl && (
                <div className="relative mb-8">
                  <div
                    className="absolute -top-2 -right-2 bottom-2 left-2 border pointer-events-none hidden sm:block"
                    style={{ borderColor: "var(--rule)" }}
                  />
                  <div
                    className="relative overflow-hidden border"
                    style={{ borderColor: "var(--rule)", aspectRatio: "16/11" }}
                  >
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <h2
                className="font-black tracking-[-0.02em] leading-[1.05] mb-5"
                style={{ fontSize: "clamp(28px,4vw,40px)" }}
              >
                {project.title}
              </h2>
              <p
                className="text-[14px] leading-[1.8] mb-8"
                style={{ color: "var(--muted-foreground)" }}
              >
                {project.description}
              </p>

              <div className="mb-8">
                <p
                  className="mono-label text-[10px] uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Stack
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {project.techStack?.map((t, i) => (
                    <span
                      key={i}
                      className="text-[13px] font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="flex items-center gap-3 mb-8 mono-label text-[12px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {project.stars != null && (
                  <span className="flex items-center gap-1">
                    <Star size={12} /> {project.stars}
                  </span>
                )}
                {project.forks != null && (
                  <span className="flex items-center gap-1">
                    <GitFork size={12} /> {project.forks}
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t" style={{ borderColor: "var(--rule)" }}>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 border py-3 text-[12px] font-bold uppercase tracking-wider transition-colors"
                    style={{ borderColor: "var(--rule)" }}
                  >
                    <FaGithub size={14} /> Code
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
                    style={{ background: "var(--signal)", color: "var(--background)" }}
                  >
                    <ArrowUpRight size={14} /> Live site
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredId, setHoveredId] = useState(null);
  const [openMobileId, setOpenMobileId] = useState(null);
  const [detailProject, setDetailProject] = useState(null);

  const allTags = ["All", ...new Set(projects.flatMap(p => p.techStack || []))];
  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter(p => p.techStack?.includes(activeFilter));
  const hovered = filtered.find(p => p.id === hoveredId) || filtered[0];

  if (isLoading) return <section className="py-24" />;

  return (
    <section
      id="projects"
      className="border-t"
      style={{ background: "var(--background)", borderColor: "var(--rule)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-20 md:py-28">
        {/* Header */}
        <div className="mb-14">
          <p
            className="mono-label text-[11px] mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            002 — selected work
          </p>
          <h2
            className="font-black tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: "clamp(36px, 5.5vw, 68px)" }}
          >
            Things I've <span className="accent-word">shipped</span>.
          </h2>
        </div>

        <FilterTabs tags={allTags} active={activeFilter} onChange={setActiveFilter} />

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 md:gap-16 mt-2">
          {/* Left — the index */}
          <div>
            {filtered.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                index={i}
                isHovered={hoveredId === project.id}
                isOpen={openMobileId === project.id}
                onHover={setHoveredId}
                onToggle={id => setOpenMobileId(prev => (prev === id ? null : id))}
                onOpenDetail={setDetailProject}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-16 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
                Nothing tagged with this filter yet.
              </p>
            )}
          </div>

          {/* Right — sticky plate, desktop only */}
          <div className="hidden md:block sticky top-24 self-start">
            <AnimatePresence mode="wait">
              {hovered && (
                <motion.div
                  key={hovered.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative">
                    <div
                      className="absolute -top-2 -right-2 bottom-2 left-2 border pointer-events-none"
                      style={{ borderColor: "var(--rule)" }}
                    />
                    <div
                      className="relative overflow-hidden border cursor-pointer"
                      style={{ borderColor: "var(--rule)", aspectRatio: "4/5" }}
                      onClick={() => setDetailProject(hovered)}
                    >
                      {hovered.imageUrl ? (
                        <img
                          src={hovered.imageUrl}
                          alt={hovered.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ background: "var(--muted)" }}
                        >
                          <span
                            className="mono-label text-[11px]"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {hovered.language || "no preview"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span
                      className="text-[11px] italic"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {hovered.title}
                    </span>
                    <span
                      className="mono-label text-[10px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      view case →
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p
          className="mt-14 text-right mono-label text-[11px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          {filtered.length} of {projects.length} projects
        </p>
      </div>

      <DetailPanel project={detailProject} onClose={() => setDetailProject(null)} />
    </section>
  );
}
