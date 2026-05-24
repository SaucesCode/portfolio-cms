import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function ManageStats() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then(res => res.data),
  });

  const handleEdit = stat => {
    setEditingId(stat.id);
    setForm({
      label: stat.label,
      value: stat.value,
      iconName: stat.iconName || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({});
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async id => {
    if (!form.label.trim()) {
      toast.error("Label is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/admin/stats/${id}`, {
        label: form.label,
        value: parseInt(form.value),
        iconName: form.iconName,
      });

      toast.success("Stat updated");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      handleCancel();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Stats</h1>
        <p className="text-gray-500 text-sm">
          Edit the numbers shown in the animated stats bar
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 border border-white/5 rounded-2xl p-5"
            >
              {editingId === stat.id ? (
                // --- Edit mode ---
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Label</label>
                      <input
                        name="label"
                        value={form.label}
                        onChange={handleChange}
                        placeholder="e.g. Projects Built"
                        className={inputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Value</label>
                      <input
                        type="number"
                        name="value"
                        value={form.value}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Icon name</label>
                      <input
                        name="iconName"
                        value={form.iconName}
                        onChange={handleChange}
                        placeholder="e.g. code"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(stat.id)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                    >
                      <Check size={14} />
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm rounded-lg transition-all"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // --- View mode ---
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Big number */}
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{stat.label}</p>
                      {stat.iconName && (
                        <p className="text-xs text-gray-500 mt-0.5">icon: {stat.iconName}</p>
                      )}
                    </div>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(stat)}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
