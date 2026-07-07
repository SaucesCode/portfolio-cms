import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Star,
  GitFork,
  ExternalLink,
  Trash2,
  Pencil,
  RefreshCw,
  FolderOpen,
  ChevronDown,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";

const SORTS = [
  { id: "order", label: "Manual order" },
  { id: "recent", label: "Recently added" },
  { id: "title", label: "Title (A–Z)" },
  { id: "stars", label: "Most stars" },
];

function StatusPill({ featured }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-5 rounded-md text-[10.5px] font-semibold shrink-0"
      style={{
        background: featured
          ? "color-mix(in oklch, var(--signal) 12%, transparent)"
          : "var(--muted)",
        color: featured ? "var(--signal)" : "var(--muted-foreground)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: featured ? "var(--signal)" : "var(--muted-foreground)" }}
      />
      {featured ? "Featured" : "Standard"}
    </span>
  );
}

function Thumb({ project, size = 44 }) {
  return (
    <div
      className="shrink-0 rounded-md overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size, background: "var(--muted)" }}
    >
      {project.imageUrl ? (
        <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <FolderOpen size={size * 0.4} style={{ color: "var(--muted-foreground)" }} />
      )}
    </div>
  );
}

export default function ManageProjects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [techFilter, setTechFilter] = useState("All");
  const [sort, setSort] = useState("order");
  const [selected, setSelected] = useState(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => api.get("/admin/projects").then(res => res.data),
  });

  const allTech = useMemo(
    () => ["All", ...new Set(projects.flatMap(p => p.techStack || []))],
    [projects],
  );

  const filtered = useMemo(() => {
    let list = [...projects];
    if (techFilter !== "All") list = list.filter(p => p.techStack?.includes(techFilter));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "recent":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "stars":
        list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        break;
      default:
        list.sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return list;
  }, [projects, query, techFilter, sort]);

  const toggleSelect = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      toast.success("Project deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  const handleToggleFeatured = async project => {
    try {
      await api.patch(`/admin/projects/${project.id}`, { featured: !project.featured });
      invalidate();
    } catch {
      toast.error("Couldn't update — try again");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Delete ${selected.size} project${selected.size !== 1 ? "s" : ""}? This can't be undone.`,
      )
    )
      return;
    try {
      await Promise.all([...selected].map(id => api.delete(`/admin/projects/${id}`)));
      toast.success(`Deleted ${selected.size} project${selected.size !== 1 ? "s" : ""}`);
      setSelected(new Set());
      invalidate();
    } catch {
      toast.error("Some deletions failed — refresh and check");
    }
  };

  const handleBulkFeature = async featured => {
    try {
      await Promise.all(
        [...selected].map(id => api.patch(`/admin/projects/${id}`, { featured })),
      );
      toast.success(featured ? "Marked as featured" : "Removed from featured");
      setSelected(new Set());
      invalidate();
    } catch {
      toast.error("Some updates failed — refresh and check");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post("/admin/github/sync");
      const synced = res.data.results.filter(r => r.status === "synced").length;
      toast.success(
        synced > 0
          ? `Synced ${synced} project${synced !== 1 ? "s" : ""} from GitHub`
          : "Already up to date",
      );
      invalidate();
    } catch {
      toast.error("Sync failed — check the connection");
    } finally {
      setIsSyncing(false);
    }
  };

  const inputBase = "h-9 rounded-lg text-[13px] outline-none transition-colors";

  return (
    <div>
      <PageHeader
        eyebrow={`${projects.length} total`}
        title="Projects"
        description="What visitors see in your portfolio's Work section."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12.5px] font-medium transition-colors disabled:opacity-50"
              style={{ border: "1px solid var(--rule)" }}
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              Sync GitHub
            </button>
            <button
              onClick={() => navigate("/admin/projects/new")}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              <Plus size={14} />
              New project
            </button>
          </div>
        }
      />

      {/* Toolbar — search, filter, sort, view toggle */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects..."
            className={`${inputBase} w-full pl-8 pr-3`}
            style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
          />
        </div>

        <select
          value={techFilter}
          onChange={e => setTechFilter(e.target.value)}
          className={`${inputBase} px-3 cursor-pointer`}
          style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
        >
          {allTech.map(t => (
            <option key={t} value={t}>
              {t === "All" ? "All technologies" : t}
            </option>
          ))}
        </select>

        <div className="relative">
          <button
            onClick={() => setSortMenuOpen(p => !p)}
            className={`${inputBase} flex items-center gap-1.5 px-3`}
            style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
          >
            {SORTS.find(s => s.id === sort)?.label}
            <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <AnimatePresence>
            {sortMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1.5 w-44 rounded-lg overflow-hidden z-20"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--rule)",
                    boxShadow: "0 8px 24px -8px rgba(0,0,0,0.15)",
                  }}
                >
                  {SORTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSort(s.id);
                        setSortMenuOpen(false);
                      }}
                      className="w-full text-left px-3 h-9 text-[12.5px] transition-colors hover:bg-[var(--muted)]"
                      style={{ color: sort === s.id ? "var(--signal)" : "var(--foreground)" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div
          className="flex items-center rounded-lg overflow-hidden shrink-0"
          style={{ border: "1px solid var(--rule)" }}
        >
          <button
            onClick={() => setView("grid")}
            className="h-9 w-9 flex items-center justify-center transition-colors"
            style={{
              background: view === "grid" ? "var(--muted)" : "transparent",
              color: view === "grid" ? "var(--foreground)" : "var(--muted-foreground)",
            }}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className="h-9 w-9 flex items-center justify-center transition-colors"
            style={{
              background: view === "list" ? "var(--muted)" : "transparent",
              color: view === "list" ? "var(--foreground)" : "var(--muted-foreground)",
            }}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Bulk action bar — appears only when something's selected */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="flex items-center justify-between gap-3 px-4 h-11 rounded-lg"
              style={{
                background: "color-mix(in oklch, var(--signal) 8%, transparent)",
                border: "1px solid var(--signal)",
              }}
            >
              <span className="text-[12.5px] font-medium" style={{ color: "var(--signal)" }}>
                {selected.size} selected
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleBulkFeature(true)}
                  className="px-2.5 h-7 rounded-md text-[12px] font-medium hover:bg-[var(--muted)]"
                >
                  Feature
                </button>
                <button
                  onClick={() => handleBulkFeature(false)}
                  className="px-2.5 h-7 rounded-md text-[12px] font-medium hover:bg-[var(--muted)]"
                >
                  Unfeature
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2.5 h-7 rounded-md text-[12px] font-medium hover:bg-[var(--muted)]"
                  style={{ color: "#c0392b" }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="p-1.5 rounded-md hover:bg-[var(--muted)]"
                  aria-label="Clear selection"
                >
                  <X size={13} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={projects.length === 0 ? "No projects yet" : "Nothing matches this search"}
          description={
            projects.length === 0
              ? "Add your first project to see it appear here."
              : "Try a different search term or filter."
          }
          action={
            projects.length === 0 && (
              <button
                onClick={() => navigate("/admin/projects/new")}
                className="mt-2 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold"
                style={{ background: "var(--signal)", color: "var(--background)" }}
              >
                New project
              </button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-lg overflow-hidden"
              style={{
                border: `1px solid ${selected.has(project.id) ? "var(--signal)" : "var(--rule)"}`,
                background: "var(--card)",
              }}
            >
              <div className="relative aspect-[16/10]" style={{ background: "var(--muted)" }}>
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen size={22} style={{ color: "var(--muted-foreground)" }} />
                  </div>
                )}
                <input
                  type="checkbox"
                  checked={selected.has(project.id)}
                  onChange={() => toggleSelect(project.id)}
                  className="absolute top-2.5 left-2.5 h-4 w-4 accent-current opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity cursor-pointer"
                  style={{ accentColor: "var(--signal)" }}
                  aria-label={`Select ${project.title}`}
                />
                <div className="absolute top-2.5 right-2.5">
                  <StatusPill featured={project.featured} />
                </div>
              </div>

              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-[13.5px] font-semibold truncate">{project.title}</h3>
                </div>
                <p
                  className="text-[12px] leading-relaxed line-clamp-2 mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.techStack?.slice(0, 3).map(t => (
                    <span
                      key={t}
                      className="px-1.5 h-5 flex items-center rounded text-[10.5px]"
                      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid var(--rule)" }}
                >
                  <div
                    className="flex items-center gap-2.5 text-[11px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {project.stars != null && (
                      <span className="flex items-center gap-1">
                        <Star size={11} />
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
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleToggleFeatured(project)}
                      className="p-1.5 rounded-md hover:bg-[var(--muted)]"
                      title="Toggle featured"
                      style={{
                        color: project.featured ? "var(--signal)" : "var(--muted-foreground)",
                      }}
                    >
                      <Star size={13} fill={project.featured ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                      className="p-1.5 rounded-md hover:bg-[var(--muted)]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 rounded-md hover:bg-[var(--muted)]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--rule)" }}
        >
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--muted)]"
              style={{
                background: "var(--card)",
                borderTop: i > 0 ? "1px solid var(--rule)" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(project.id)}
                onChange={() => toggleSelect(project.id)}
                className="h-4 w-4 shrink-0 cursor-pointer"
                style={{ accentColor: "var(--signal)" }}
                aria-label={`Select ${project.title}`}
              />
              <Thumb project={project} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-[13.5px] font-semibold truncate">{project.title}</h3>
                  <StatusPill featured={project.featured} />
                </div>
                <p
                  className="text-[12px] truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {project.techStack?.join(" · ") || "No stack tagged"}
                </p>
              </div>
              <div
                className="hidden md:flex items-center gap-3 text-[11px] shrink-0"
                style={{ color: "var(--muted-foreground)" }}
              >
                {project.stars != null && (
                  <span className="flex items-center gap-1">
                    <Star size={11} />
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
              <div className="flex items-center gap-0.5 shrink-0">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-[var(--card)]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <FaGithub size={13} />
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-[var(--card)]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={() => handleToggleFeatured(project)}
                  className="p-1.5 rounded-md hover:bg-[var(--card)]"
                  title="Toggle featured"
                  style={{
                    color: project.featured ? "var(--signal)" : "var(--muted-foreground)",
                  }}
                >
                  <Star size={13} fill={project.featured ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                  className="p-1.5 rounded-md hover:bg-[var(--card)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 rounded-md hover:bg-[var(--card)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
