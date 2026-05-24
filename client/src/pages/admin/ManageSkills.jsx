import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const CATEGORIES = ["Frontend", "Backend", "Tools", "Other"];

const emptyForm = {
  name: "",
  category: "Frontend",
  proficiencyLevel: 3,
  iconName: "",
  orderIndex: 0,
};

export default function ManageSkills() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["admin-skills"],
    queryFn: () => api.get("/admin/skills").then(res => res.data),
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Opens the form pre-filled with existing skill data
  const handleEdit = skill => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      category: skill.category,
      proficiencyLevel: skill.proficiencyLevel,
      iconName: skill.iconName || "",
      orderIndex: skill.orderIndex,
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
    if (!form.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // PATCH — update existing skill
        await api.patch(`/admin/skills/${editingId}`, {
          ...form,
          proficiencyLevel: parseInt(form.proficiencyLevel),
          orderIndex: parseInt(form.orderIndex),
        });
        toast.success("Skill updated");
      } else {
        // POST — create new skill
        await api.post("/admin/skills", {
          ...form,
          proficiencyLevel: parseInt(form.proficiencyLevel),
          orderIndex: parseInt(form.orderIndex),
        });
        toast.success("Skill added");
      }

      // Invalidate the cache so the table refetches fresh data
      // This is the pattern we use after every create/update/delete
      queryClient.invalidateQueries({ queryKey: ["admin-skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] }); // also refresh public data
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    // Simple confirmation before deleting
    if (!window.confirm("Delete this skill?")) return;

    try {
      await api.delete(`/admin/skills/${id}`);
      toast.success("Skill deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    } catch (error) {
      toast.error("Failed to delete");
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
          <h1 className="text-2xl font-bold text-white mb-1">Skills</h1>
          <p className="text-gray-500 text-sm">{skills.length} skills total</p>
        </div>

        {/* Add button — hides when form is open */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus size={16} />
            Add Skill
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
              {editingId ? "Edit Skill" : "Add New Skill"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. React"
                    className={inputClass}
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proficiency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">
                    Proficiency (1–5) — currently: {form.proficiencyLevel}
                  </label>
                  <input
                    type="range"
                    name="proficiencyLevel"
                    min="1"
                    max="5"
                    value={form.proficiencyLevel}
                    onChange={handleChange}
                    className="accent-blue-500"
                  />
                </div>

                {/* Order index */}
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
              </div>

              {/* Form actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                >
                  <Check size={15} />
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Add Skill"}
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

      {/* Skills table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          No skills yet — add your first one above.
        </div>
      ) : (
        <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Name</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">
                  Category
                </th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">
                  Proficiency
                </th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">
                  Order
                </th>
                <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => (
                <motion.tr
                  key={skill.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-white font-medium">{skill.name}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {skill.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {/* Proficiency dots */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`w-1.5 h-1.5 rounded-full ${
                            level <= skill.proficiencyLevel ? "bg-blue-400" : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{skill.orderIndex}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
