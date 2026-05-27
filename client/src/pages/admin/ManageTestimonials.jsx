import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const emptyForm = {
  name: "",
  role: "",
  company: "",
  avatarUrl: "",
  quote: "",
  visible: true,
  orderIndex: 0,
};

export default function ManageTestimonials() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => api.get("/admin/testimonials").then(res => res.data),
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = testimonial => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      avatarUrl: testimonial.avatarUrl || "",
      quote: testimonial.quote,
      visible: testimonial.visible,
      orderIndex: testimonial.orderIndex,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("Name and quote are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex),
      };

      if (editingId) {
        await api.patch(`/admin/testimonials/${editingId}`, payload);
        toast.success("Testimonial updated");
      } else {
        await api.post("/admin/testimonials", payload);
        toast.success("Testimonial added");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      toast.success("Testimonial deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleToggleVisible = async testimonial => {
    try {
      await api.patch(`/admin/testimonials/${testimonial.id}`, {
        visible: !testimonial.visible,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(testimonial.visible ? "Hidden from public" : "Now visible");
    } catch (error) {
      toast.error("Failed to update");
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
            Testimonial Matrix
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground">
            Mutate and organize compiled professional recommendation nodes (
            {testimonials.length} records)
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Attribution Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Maria Santos"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Role Title Vector
                  </label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Product Manager"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Company Entity
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Tech Startup PH"
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

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Avatar Image Asset Source URL (Optional)
                  </label>
                  <input
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Quote */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Recommendation Text Manifest
                </label>
                <textarea
                  name="quote"
                  value={form.quote}
                  onChange={handleChange}
                  placeholder="What did they say about your professional contributions?"
                  rows={3}
                  className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed font-sans text-xs`}
                />
              </div>

              {/* Visibility Switch */}
              <div className="flex items-center justify-between gap-4 h-10 border border-dashed border-border rounded-lg px-3 mt-1 select-none w-full sm:w-72">
                <label
                  htmlFor="visible"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] cursor-pointer"
                >
                  Flag as Publicly Active
                </label>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, visible: !prev.visible }))}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 shrink-0 cursor-pointer border border-transparent
                    ${form.visible ? "bg-primary" : "bg-muted border-border"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-150
                    ${form.visible ? "translate-x-4 bg-primary-foreground" : "translate-x-0"}`}
                  />
                </button>
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

      {/* Testimonials list */}
      {testimonials.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            Zero endorsement target arrays detected inside matrix.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-card border rounded-xl p-4 subpixel-antialiased shadow-sm transition-colors group
                ${testimonial.visible ? "border-border hover:border-foreground/10" : "border-border/40 opacity-40"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 flex items-start gap-3.5">
                  {/* Dynamic Avatar Node */}
                  {testimonial.avatarUrl ? (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      className="w-8 h-8 rounded-full object-cover border border-border/60 shrink-0 select-none"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary text-[10px] font-mono font-bold shrink-0 select-none">
                      {testimonial.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Name + corporate meta details */}
                    <div className="flex items-center gap-2 mb-1 select-none">
                      <h3 className="text-xs font-bold text-foreground tracking-wide truncate">
                        {testimonial.name}
                      </h3>
                      <span className="font-mono text-muted-foreground/40 text-[11px]">/</span>
                      <span className="text-[11px] font-mono text-muted-foreground tracking-tight truncate">
                        {testimonial.role} at {testimonial.company}
                      </span>
                      {!testimonial.visible && (
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                          Offline
                        </span>
                      )}
                    </div>

                    {/* Quote text node */}
                    <p className="text-[11px] text-muted-foreground font-sans leading-relaxed line-clamp-2 mb-2">
                      “{testimonial.quote}”
                    </p>

                    {/* Sequence tracking matrix bar */}
                    <div className="text-[9px] font-mono text-muted-foreground/40 select-none">
                      SEQ_IDX: {testimonial.orderIndex}
                    </div>
                  </div>
                </div>

                {/* Actions grid array */}
                <div className="flex gap-1 shrink-0 select-none">
                  <button
                    onClick={() => handleToggleVisible(testimonial)}
                    className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title={
                      testimonial.visible
                        ? "Deactivate node deployment"
                        : "Activate node deployment"
                    }
                  >
                    {testimonial.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
