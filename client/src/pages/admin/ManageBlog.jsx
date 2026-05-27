import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  Layers,
  Link,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImageUrl: "",
  tags: [],
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ManageBlog() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => api.get("/admin/blog").then(res => res.data),
  });

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === "title") {
      setForm(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = value => {
    setForm(prev => ({ ...prev, content: value }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (form.tags.includes(newTag.trim())) return;
    setForm(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag("");
  };

  const handleRemoveTag = index => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = post => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImageUrl: post.coverImageUrl || "",
      tags: post.tags || [],
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setNewTag("");
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/admin/blog/${editingId}`, form);
        toast.success("Post updated");
      } else {
        await api.post("/admin/blog", form);
        toast.success("Post created as draft");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleTogglePublish = async post => {
    try {
      await api.patch(`/admin/blog/${post.id}/publish`);
      toast.success(post.published ? "Post unpublished" : "Post published");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const inputClass = `
    w-full px-3 h-10 rounded-lg text-[11px] font-mono tracking-wide
    bg-background border border-border
    text-white placeholder:text-muted-foreground/40
    focus:outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10
    transition-all duration-150
  `;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 select-none">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto selection:bg-primary/10 selection:text-primary px-2">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
            Content Node Registry
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground">
            {posts.filter(p => p.published).length} published ·{" "}
            {posts.filter(p => !p.published).length} drafts compiled inside pipeline
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 h-10 bg-primary text-primary-foreground text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-primary/90 cursor-pointer shadow-sm"
          >
            <Plus size={12} />
            Initialize Post
          </button>
        )}
      </div>

      {/* Editor Form Panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm mb-5"
          >
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 border-b border-border/50 pb-2">
              {editingId ? "Edit Document Configuration" : "New Document Configuration"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Post Document Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="My awesome blog post"
                    className={inputClass}
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    URL Slug Route{" "}
                    <span className="text-muted-foreground/30 font-normal tracking-normal lowercase">
                      (auto-generated)
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-[11px] font-mono text-muted-foreground/40 pointer-events-none select-none">
                      /blog/
                    </span>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      className={`${inputClass} pl-[48px]`}
                    />
                  </div>
                </div>

                {/* Cover Image URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Cover Asset Resource URL
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-muted-foreground/40 pointer-events-none">
                      <Link size={11} />
                    </span>
                    <input
                      name="coverImageUrl"
                      value={form.coverImageUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/cover.jpg"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                {/* Tags Engine */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Meta Taxonomy Tags
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 flex items-center">
                      <span className="absolute left-3 text-muted-foreground/40 pointer-events-none">
                        <Layers size={11} />
                      </span>
                      <input
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Type tag and press Enter or click Add"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="flex items-center gap-1.5 px-3.5 h-10 bg-neutral-950 border border-neutral-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Tag size={11} />
                      Inject
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags Display Pool */}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 bg-neutral-950 border border-neutral-900 rounded-lg p-2.5">
                  {form.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="text-muted-foreground/40 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Excerpt Summary */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Brief Deck Abstract Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  placeholder="Short localized structural summary displayed inside primary tracking cards"
                  rows={2}
                  className="w-full p-3 h-16 rounded-lg text-[11px] font-mono tracking-wide bg-background border border-border text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10 transition-all duration-150 resize-none"
                />
              </div>

              {/* Custom Embedded Markdown Editor */}
              <div className="flex flex-col gap-1.5 unique-editor-dark">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Document Markdown Stream Stream
                </label>
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 p-1">
                  <SimpleMDE
                    value={form.content}
                    onChange={handleContentChange}
                    options={{
                      autofocus: false,
                      spellChecker: false,
                      placeholder: "Write raw markdown stream...",
                      status: false,
                    }}
                  />
                </div>
              </div>

              {/* Panel Trigger Utilities */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50 mt-1 select-none">
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
                  {isSubmitting
                    ? "Syncing..."
                    : editingId
                      ? "Commit Updates"
                      : "Write Draft Node"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Wide Layout Posts View Map Container */}
      {posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            Zero blog nodes deployed within system streams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 w-full">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="w-full bg-card border border-border rounded-xl p-4 subpixel-antialiased shadow-sm transition-all duration-150 hover:border-foreground/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  {/* Title and Active Deployment Status Metrics */}
                  <div className="min-w-0 md:w-2/5">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-[280px] sm:max-w-md">
                        {post.title}
                      </h3>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border select-none
                        ${
                          post.published
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-neutral-900 text-neutral-500 border-neutral-800"
                        }`}
                      >
                        {post.published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-500 truncate">
                      /blog/{post.slug}
                    </p>
                  </div>

                  {/* Tags Taxonomies Block */}
                  <div className="hidden sm:flex flex-wrap gap-1.5 flex-1 min-w-0 items-center">
                    {post.tags?.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono text-neutral-400 bg-neutral-900/60 border border-neutral-800 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags?.length > 4 && (
                      <span className="text-[9px] font-mono text-neutral-600 px-1">
                        +{post.tags.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* System Publish Timestamps */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 shrink-0 select-none">
                    <Calendar size={11} className="text-neutral-600" />
                    <span>
                      {post.publishedAt ? formatDate(post.publishedAt) : "UNPUBLISHED"}
                    </span>
                  </div>
                </div>

                {/* Operations Manipulation Trigger Control Hub */}
                <div className="flex items-center justify-end gap-1 shrink-0 select-none border-t sm:border-t-0 border-border/30 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`p-1.5 rounded-lg border border-transparent transition-all cursor-pointer
                      ${
                        post.published
                          ? "text-emerald-400 hover:text-neutral-400 hover:bg-neutral-900 hover:border-neutral-800"
                          : "text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-transparent"
                      }`}
                    title={post.published ? "Retract Deployment" : "Deploy Pipeline Live"}
                  >
                    {post.published ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-1.5 text-muted-foreground/50 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-800 rounded-lg transition-all cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Global CSS injection for dark Markdown editor styling resets */}
      <style>{`
        .unique-editor-dark .EasyMDEContainer .CodeMirror {
          background: #0a0a0a !important;
          color: #f5f5f5 !important;
          border-color: #1f1f1f !important;
          font-family: monospace !important;
          font-size: 11px !important;
        }
        .unique-editor-dark .EasyMDEContainer .editor-toolbar {
          background: #000000 !important;
          border-color: #1f1f1f !important;
          opacity: 0.8;
        }
        .unique-editor-dark .EasyMDEContainer .editor-toolbar button {
          color: #ffffff !important;
        }
        .unique-editor-dark .EasyMDEContainer .editor-toolbar button.active,
        .unique-editor-dark .EasyMDEContainer .editor-toolbar button:hover {
          background: #1f1f1f !important;
        }
      `}</style>
    </div>
  );
}
