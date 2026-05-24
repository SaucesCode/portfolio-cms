import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff, Calendar, Tag } from "lucide-react";
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

// Converts title to URL slug
// "My Blog Post" → "my-blog-post"
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

    // Auto-generate slug when title changes
    if (name === "title") {
      setForm(prev => ({
        ...prev,
        title: value,
        // Only auto-generate if slug hasn't been manually edited
        slug: generateSlug(value),
      }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  // SimpleMDE calls onChange with the value directly, not an event
  const handleContentChange = value => {
    setForm(prev => ({ ...prev, content: value }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
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

  // Publish / unpublish toggle
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
    w-full px-3 py-2 rounded-lg text-sm
    bg-gray-800 border border-white/10
    text-white placeholder:text-gray-600
    focus:outline-none focus:border-blue-500/50
    transition-all duration-200
  `;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Blog</h1>
          <p className="text-gray-500 text-sm">
            {posts.filter(p => p.published).length} published ·{" "}
            {posts.filter(p => !p.published).length} drafts
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus size={16} />
            New Post
          </button>
        )}
      </div>

      {/* Editor form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-sm font-semibold text-white mb-4">
              {editingId ? "Edit Post" : "New Post"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="My awesome blog post"
                  className={inputClass}
                />
              </div>

              {/* Slug — auto-generated but editable */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">
                  Slug
                  <span className="text-gray-600 ml-1">
                    (auto-generated, but you can edit it)
                  </span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-white/10">
                  <span className="text-gray-600 text-sm">/blog/</span>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  placeholder="Short summary shown in the blog card"
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Cover image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Cover Image URL</label>
                <input
                  name="coverImageUrl"
                  value={form.coverImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  className={inputClass}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Tags</label>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g. React"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all whitespace-nowrap"
                  >
                    <Tag size={14} />
                    Add
                  </button>
                </div>
              </div>

              {/* Markdown editor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Content (Markdown)</label>
                <div className="rounded-lg overflow-hidden border border-white/10">
                  <SimpleMDE
                    value={form.content}
                    onChange={handleContentChange}
                    options={{
                      autofocus: false,
                      spellChecker: false,
                      placeholder: "Write your post in markdown...",
                      status: false,
                    }}
                  />
                </div>
              </div>

              {/* Form actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                >
                  <Check size={15} />
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm rounded-lg transition-all"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          No posts yet — write your first one!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-blue-500/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title + status */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{post.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border
                      ${
                        post.published
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-gray-800 text-gray-500 border-white/5"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Slug */}
                  <p className="text-xs text-gray-600 font-mono mb-2">/blog/{post.slug}</p>

                  {/* Tags + date */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {post.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-gray-500">
                        #{tag}
                      </span>
                    ))}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar size={11} />
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {/* Publish toggle */}
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`p-1.5 rounded-lg transition-all
                      ${
                        post.published
                          ? "text-green-400 hover:text-gray-400 hover:bg-white/10"
                          : "text-gray-500 hover:text-green-400 hover:bg-green-400/10"
                      }`}
                    title={post.published ? "Unpublish" : "Publish"}
                  >
                    {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
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
