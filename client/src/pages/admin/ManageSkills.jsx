import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Code,
  Settings,
  Briefcase,
  Layout,
} from "lucide-react";
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

const getCategoryIcon = category => {
  switch (category) {
    case "Frontend":
      return <Layout size={14} />;
    case "Backend":
      return <Code size={14} />;
    case "Tools":
      return <Settings size={14} />;
    default:
      return <Briefcase size={14} />;
  }
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
      const payload = {
        ...form,
        proficiencyLevel: parseInt(form.proficiencyLevel),
        orderIndex: parseInt(form.orderIndex),
      };

      if (editingId) {
        await api.patch(`/admin/skills/${editingId}`, payload);
        toast.success("Skill updated");
      } else {
        await api.post("/admin/skills", payload);
        toast.success("Skill added");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
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
    <div className="w-full selection:bg-primary/10 selection:text-primary">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
            Skill Matrix
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground">
            Mutate and balance specialized core competencies ({skills.length} records)
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
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Skill Identifier Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. React"
                    className={inputClass}
                  />
                </div>

                {/* Category Dropdown (Explicit fallback styling for absolute visibility) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Classification Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 h-10 rounded-lg text-[11px] font-mono tracking-wide bg-neutral-900 border border-neutral-800 text-white cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(c => (
                      <option
                        key={c}
                        value={c}
                        className="bg-neutral-900 text-white font-mono text-xs"
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order index */}
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

                {/* Proficiency Weight Slider (Forced styling fallback for explicit line view) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                    Proficiency Weight Vector: {form.proficiencyLevel} / 5
                  </label>
                  <div className="flex items-center h-10 border border-border rounded-lg px-4 bg-background relative">
                    {/* Fallback structural inline guide track layout */}
                    <div className="absolute left-4 right-4 h-1.5 bg-neutral-800 rounded-full border border-neutral-700/50 pointer-events-none overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${((form.proficiencyLevel - 1) / 4) * 100}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      name="proficiencyLevel"
                      min="1"
                      max="5"
                      value={form.proficiencyLevel}
                      onChange={handleChange}
                      className="w-full h-6 opacity-0 sm:opacity-100 accent-blue-500 bg-transparent appearance-none cursor-pointer relative z-10"
                    />
                  </div>
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

      {/* Skills Streams Overhauled Layout with Fallback Color Line Metrics */}
      {skills.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            Zero technology array nodes detected inside matrix.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="group relative bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-foreground/10 transition-all duration-150 subpixel-antialiased shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Structural Category Icon Module */}
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-muted-foreground/70 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors select-none">
                  {getCategoryIcon(skill.category)}
                </div>

                <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 items-center">
                  {/* Left Column: Core Meta Data */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">
                        {skill.name}
                      </h3>
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800 select-none">
                        {skill.category}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground/40 mt-1 select-none">
                      SEQ_IDX: {skill.orderIndex}
                    </div>
                  </div>

                  {/* Right Column: Fallback Safe High-Contrast Line Tracking Indicator */}
                  <div className="flex items-center gap-4 select-none min-w-[160px]">
                    <div className="relative flex-1 h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                      {/* Using safe high-contrast fallback color utilities */}
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${(skill.proficiencyLevel / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded min-w-[32px] text-center shadow-sm">
                      {skill.proficiencyLevel}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Interface Controls Array */}
              <div className="flex items-center justify-end gap-1 shrink-0 select-none border-t sm:border-t-0 border-border/30 pt-2 sm:pt-0">
                <button
                  onClick={() => handleEdit(skill)}
                  className="p-1.5 text-muted-foreground/50 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-1.5 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
