import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  Star,
  GitFork,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const emptyForm = {
  title: "",
  description: "",
  techStack: [],
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  githubRepoName: "",
  featured: false,
  orderIndex: 0,
};

export default function ManageProjects() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [newTech, setNewTech] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => api.get("/admin/projects").then(res => res.data),
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = project => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      techStack: project.techStack || [],
      imageUrl: project.imageUrl || "",
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      githubRepoName: project.githubRepoName || "",
      featured: project.featured,
      orderIndex: project.orderIndex,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setNewTech("");
  };

  const handleAddTech = () => {
    if (!newTech.trim()) return;
    setForm(prev => ({
      ...prev,
      techStack: [...prev.techStack, newTech.trim()],
    }));
    setNewTech("");
  };

  const handleRemoveTech = index => {
    setForm(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }));
  };

  const handleAutoFill = async () => {
    if (!form.githubRepoName.trim()) {
      toast.error("Enter a repo name first");
      return;
    }

    setIsAutoFilling(true);
    try {
      const res = await api.get(`/admin/github/repo/${form.githubRepoName}`);
      const { title, description, language, githubUrl } = res.data;

      setForm(prev => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        githubUrl: githubUrl || prev.githubUrl,
        techStack:
          language && !prev.techStack.includes(language)
            ? [...prev.techStack, language]
            : prev.techStack,
      }));

      toast.success("Fields pre-filled from GitHub!");
    } catch (error) {
      toast.error("Could not fetch repo — check the repo name");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex),
      };

      if (editingId) {
        await api.patch(`/admin/projects/${editingId}`, payload);
        toast.success("Project updated");
      } else {
        await api.post("/admin/projects", payload);
        toast.success("Project added");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleSyncOne = async project => {
    if (!project.githubRepoName) {
      toast.error("No GitHub repo linked to this project");
      return;
    }

    setSyncingId(project.id);
    try {
      await api.post("/admin/github/sync");
      toast.success("GitHub data synced");
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  const inputClass = `
    w-full px-3 h-10 rounded-lg text-[11px] font-mono tracking-wide
    bg-background border border-border
    text-foreground placeholder:text-muted-foreground/40
    focus:outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10
    transition-all duration-150
  `;

  if (isLoading)
    return (
      <div className="flex justify-center py-24 select-none">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="w-full selection:bg-primary/10 selection:text-primary">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
            Project Matrix
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground">
            Mutate and deployment-map compiled portfolio stack entities ({projects.length}{" "}
            nodes)
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 h-10 bg-primary text-primary-foreground text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-primary/90 cursor-pointer shadow-sm"
          >
            <Plus size={12} />
            Initialize Node
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm mb-5"
          >
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 border-b border-border/50 pb-2">
              {editingId ? "Edit Configuration Registry" : "New Configuration Registry"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* GitHub repo name + auto-fill */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  GitHub Repos Identity Sync Target{" "}
                  <span className="text-muted-foreground/40 font-mono tracking-normal normal-case">
                    (optional)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    name="githubRepoName"
                    value={form.githubRepoName}
                    onChange={handleChange}
                    placeholder="e.g. QuickAid-Geomapping"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isAutoFilling}
                    className="flex items-center gap-1.5 px-3.5 h-10 bg-muted border border-border hover:bg-muted/80 text-foreground text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Sparkles size={12} className={isAutoFilling ? "animate-pulse" : ""} />
                    {isAutoFilling ? "Parsing..." : "Auto-Fill"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Title Vector
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Project title"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Order Sequence Index
                  </label>
                  <input
                    type="number"
                    name="orderIndex"
                    value={form.orderIndex}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Production Deployment Target URI
                  </label>
                  <input
                    name="liveUrl"
                    value={form.liveUrl}
                    onChange={handleChange}
                    placeholder="https://yourproject.com"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    VCS Repository Link
                  </label>
                  <input
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Static Asset Cover URI
                  </label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                </div>

                {/* Featured toggle */}
                <div className="flex items-center justify-between gap-4 h-10 border border-dashed border-border rounded-lg px-3 mt-auto select-none">
                  <label
                    htmlFor="featured"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] cursor-pointer"
                  >
                    Promote to Featured Cluster
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, featured: !prev.featured }))}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-150 shrink-0 cursor-pointer border border-transparent
                      ${form.featured ? "bg-primary" : "bg-muted border-border"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-150
                      ${form.featured ? "translate-x-4 bg-primary-foreground" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Operational Scope Manifest
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What tasks and architectures does this node accomplish?"
                  rows={3}
                  className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed font-sans text-xs`}
                />
              </div>

              {/* Tech stack tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Core Compilers & Framework Tags
                </label>

                {form.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {form.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 text-[10px] font-mono tracking-wide px-2.5 h-6 rounded-md bg-muted/50 text-foreground border border-border"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(index)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="e.g. React"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="flex items-center gap-1.5 px-3.5 h-10 bg-muted border border-border hover:bg-muted/80 text-foreground text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Plus size={12} />
                    Append
                  </button>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end gap-2 pt-1 border-t border-border/50 mt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 h-10 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  <X size={12} />
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 h-10 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Check size={12} />
                  {isSubmitting ? "Syncing..." : editingId ? "Commit Changes" : "Write Record"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            Zero telemetry target arrays detected inside pipeline matrix.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card border border-border rounded-xl p-4 subpixel-antialiased shadow-sm hover:border-foreground/10 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Title + featured badge */}
                  <div className="flex items-center gap-2 mb-1 select-none">
                    <h3 className="text-xs font-bold text-foreground tracking-wide truncate">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed line-clamp-1 mb-2.5">
                    {project.description}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1 mb-3 select-none">
                    {project.techStack.slice(0, 5).map(tech => (
                      <span
                        key={tech}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground/80 border border-border/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* GitHub stats */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/50 select-none">
                    {project.stars !== null && project.stars !== undefined && (
                      <span className="flex items-center gap-1">
                        <Star size={11} />
                        {project.stars}
                      </span>
                    )}
                    {project.forks !== null && project.forks !== undefined && (
                      <span className="flex items-center gap-1">
                        <GitFork size={11} />
                        {project.forks}
                      </span>
                    )}
                    {project.language && (
                      <span className="text-muted-foreground/70">{project.language}</span>
                    )}
                    {project.githubSyncedAt && (
                      <span className="text-muted-foreground/30 text-[9px]">
                        SYN_OK {new Date(project.githubSyncedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0 select-none">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <FaGithub size={13} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}

                  {/* Sync button */}
                  {project.githubRepoName && (
                    <button
                      onClick={() => handleSyncOne(project)}
                      disabled={syncingId === project.id}
                      className="p-1.5 text-muted-foreground/50 hover:text-primary hover:bg-muted rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="Sync GitHub data"
                    >
                      <RefreshCw
                        size={13}
                        className={syncingId === project.id ? "animate-spin" : ""}
                      />
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
