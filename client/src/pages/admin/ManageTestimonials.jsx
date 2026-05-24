import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Quote, Eye, EyeOff } from "lucide-react";
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

  // Quick toggle visible without opening the form
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
          <h1 className="text-2xl font-bold text-white mb-1">Testimonials</h1>
          <p className="text-gray-500 text-sm">{testimonials.length} testimonials</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus size={16} />
            Add Testimonial
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-sm font-semibold text-white mb-4">
              {editingId ? "Edit Testimonial" : "Add Testimonial"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Maria Santos"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Product Manager"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Tech Startup PH"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Order</label>
                  <input
                    type="number"
                    name="orderIndex"
                    value={form.orderIndex}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-gray-400">Avatar URL (optional)</label>
                  <input
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-gray-400">Quote</label>
                  <textarea
                    name="quote"
                    value={form.quote}
                    onChange={handleChange}
                    placeholder="What did they say about you?"
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Visible toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="visible"
                    name="visible"
                    checked={form.visible}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <label htmlFor="visible" className="text-sm text-gray-300 cursor-pointer">
                    Visible on public site
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                >
                  <Check size={15} />
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
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

      {/* Testimonials list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No testimonials yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gray-900 border rounded-2xl p-5 transition-colors
                ${
                  testimonial.visible
                    ? "border-white/5 hover:border-blue-500/10"
                    : "border-white/5 opacity-50"
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {testimonial.avatarUrl ? (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-semibold flex-shrink-0">
                      {testimonial.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Name + role */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white">{testimonial.name}</h3>
                      {!testimonial.visible && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-white/5">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {testimonial.role} · {testimonial.company}
                    </p>

                    {/* Quote */}
                    <p className="text-sm text-gray-400 italic line-clamp-2">
                      <Quote size={12} className="inline mr-1 text-blue-500/40" />
                      {testimonial.quote}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {/* Quick visibility toggle */}
                  <button
                    onClick={() => handleToggleVisible(testimonial)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title={testimonial.visible ? "Hide" : "Show"}
                  >
                    {testimonial.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
