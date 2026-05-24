import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const emptyForm = {
  company: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  orderIndex: 0,
};

// Formats date from DB (ISO string) to HTML date input format (YYYY-MM-DD)
function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export default function ManageExperience() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: () => api.get("/admin/experiences").then(res => res.data),
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    // Checkboxes use 'checked' not 'value'
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = exp => {
    setEditingId(exp.id);
    setForm({
      company: exp.company,
      role: exp.role,
      description: exp.description,
      startDate: toInputDate(exp.startDate),
      endDate: toInputDate(exp.endDate),
      isCurrent: exp.isCurrent,
      orderIndex: exp.orderIndex,
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

    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    if (!form.startDate) {
      toast.error("Start date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex),
        // If current role, clear end date
        endDate: form.isCurrent ? null : form.endDate || null,
      };

      if (editingId) {
        await api.patch(`/admin/experiences/${editingId}`, payload);
        toast.success("Experience updated");
      } else {
        await api.post("/admin/experiences", payload);
        toast.success("Experience added");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await api.delete(`/admin/experiences/${id}`);
      toast.success("Experience deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

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
          <h1 className="text-2xl font-bold text-white mb-1">Experience</h1>
          <p className="text-gray-500 text-sm">{experiences.length} entries</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus size={16} />
            Add Experience
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
              {editingId ? "Edit Experience" : "Add Experience"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="text-xs text-gray-400">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    // Disable end date if current role
                    disabled={form.isCurrent}
                    className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
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

                {/* Current role toggle */}
                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    name="isCurrent"
                    checked={form.isCurrent}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <label htmlFor="isCurrent" className="text-sm text-gray-300 cursor-pointer">
                    This is my current role
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What did you do here?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Form actions */}
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

      {/* Experiences list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No experience entries yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-blue-500/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Role + current badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{exp.role}</h3>
                    {exp.isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  <p className="text-sm text-blue-400 mb-2">{exp.company}</p>

                  {/* Date range */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={11} />
                    {formatDate(exp.startDate)} —{" "}
                    {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
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
