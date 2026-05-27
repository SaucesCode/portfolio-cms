import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Pencil, X, BarChart3, Layers, Hash } from "lucide-react";
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
    if (!form.label?.trim()) {
      toast.error("Label is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/admin/stats/${id}`, {
        label: form.label,
        value: parseInt(form.value) || 0,
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
      <div className="mb-6 select-none">
        <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
          Metric Registry Matrix
        </h1>
        <p className="text-[11px] font-mono text-muted-foreground">
          Calibrate structural quantitative parameters deployed across presentation interfaces
        </p>
      </div>

      {/* High-visibility horizontal layout container split for wider screens */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="w-full bg-card border border-border rounded-xl p-4 subpixel-antialiased shadow-sm transition-all duration-150"
          >
            {editingId === stat.id ? (
              /* --- Edit mode row configuration --- */
              <div className="flex flex-col lg:flex-row items-end gap-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                  {/* Label input */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                      Descriptor Label
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground/40 pointer-events-none">
                        <Layers size={11} />
                      </span>
                      <input
                        name="label"
                        value={form.label || ""}
                        onChange={handleChange}
                        placeholder="e.g. Projects Built"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>

                  {/* Value input */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                      Scalar Metric Value
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground/40 pointer-events-none">
                        <Hash size={11} />
                      </span>
                      <input
                        type="number"
                        name="value"
                        value={form.value ?? ""}
                        onChange={handleChange}
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>

                  {/* IconName input */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                      Icon Token Identifier
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground/40 pointer-events-none">
                        <BarChart3 size={11} />
                      </span>
                      <input
                        name="iconName"
                        value={form.iconName || ""}
                        onChange={handleChange}
                        placeholder="e.g. code"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                </div>

                {/* Mutation Actions Row */}
                <div className="flex justify-end gap-2 select-none shrink-0 w-full lg:w-auto pb-0.5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 h-10 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={12} />
                    Abort
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(stat.id)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 h-10 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <Check size={12} />
                    {isSubmitting ? "Syncing..." : "Commit"}
                  </button>
                </div>
              </div>
            ) : (
              /* --- Wide stream row view display layout --- */
              <div className="flex flex-row items-center justify-between gap-6 w-full">
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  {/* Fixed numeric badge tracker container */}
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground select-all bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800 min-w-[90px] text-center shadow-inner">
                    {stat.value}
                  </div>

                  {/* Expanded textual label details block */}
                  <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 items-center">
                    <p className="text-xs font-bold text-white tracking-wide truncate">
                      {stat.label}
                    </p>

                    <div className="whitespace-nowrap sm:text-right">
                      {stat.iconName ? (
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/60 border border-neutral-800/80 px-2.5 py-1 rounded-md uppercase tracking-wider select-none">
                          token:{" "}
                          <span className="text-blue-400 font-bold">{stat.iconName}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-600 border border-neutral-800/30 px-2.5 py-1 rounded-md uppercase tracking-wider select-none italic">
                          unassigned-token
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit interactions trigger configuration */}
                <button
                  onClick={() => handleEdit(stat)}
                  className="p-2 text-muted-foreground/50 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-800 rounded-lg transition-all cursor-pointer shrink-0 select-none"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
