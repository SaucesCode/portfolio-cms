import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Calendar,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";
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
    setEditingId(null);
    setShowForm(false);
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
        endDate: form.isCurrent ? null : form.endDate || null,
      };

      if (editingId) {
        await api.patch(`/admin/experiences/${editingId}`, payload);
        toast.success("Timeline node updated");
      } else {
        await api.post("/admin/experiences", payload);
        toast.success("Timeline node initialized");
      }

      queryClient.invalidateQueries({
        queryKey: ["admin-experiences"],
      });

      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });

      handleCancel();
    } catch (error) {
      toast.error("Registry mutation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this timeline node?")) return;

    try {
      await api.delete(`/admin/experiences/${id}`);

      toast.success("Timeline node deleted");

      queryClient.invalidateQueries({
        queryKey: ["admin-experiences"],
      });

      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });
    } catch (error) {
      toast.error("Deletion failed");
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
    w-full px-3 h-10 rounded-lg text-[11px]
    font-mono tracking-wide
    bg-background border border-border
    text-foreground placeholder:text-muted-foreground/40
    focus:outline-none focus:border-foreground/20
    focus:ring-1 focus:ring-foreground/10
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
            Career Timeline
          </h1>

          <p className="text-[11px] font-mono text-muted-foreground">
            Workforce history registry contains ({experiences.length}) timeline nodes
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

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm mb-5"
          >
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 border-b border-border/50 pb-2">
              {editingId ? "Edit Workforce Registry" : "Initialize Workforce Registry"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                    Organization Identity
                  </label>

                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Tech Startup PH"
                    className={inputClass}
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                    Position Vector
                  </label>

                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    className={inputClass}
                  />
                </div>

                {/* Start date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                    Initialization Timestamp
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* End date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                    Archive Timestamp
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={form.isCurrent}
                    className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                  />
                </div>

                {/* Order */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                    Sequence Index
                  </label>

                  <input
                    type="number"
                    name="orderIndex"
                    value={form.orderIndex}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Current role toggle */}
                <div className="flex items-center justify-between gap-4 h-10 border border-dashed border-border rounded-lg px-3 mt-auto select-none">
                  <label
                    htmlFor="isCurrent"
                    className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground cursor-pointer"
                  >
                    Active Timeline Node
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        isCurrent: !prev.isCurrent,
                      }))
                    }
                    className={`relative w-9 h-5 rounded-full transition-colors duration-150 shrink-0 cursor-pointer border border-transparent
                    ${form.isCurrent ? "bg-primary" : "bg-muted border-border"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-150
                      ${
                        form.isCurrent
                          ? "translate-x-4 bg-primary-foreground"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                  Operational Responsibility Manifest
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe responsibilities, technologies, and operational scope..."
                  rows={4}
                  className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed font-sans text-xs`}
                />
              </div>

              {/* Actions */}
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

      {/* Experience list */}
      {experiences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            Zero workforce timeline nodes detected inside registry.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card border border-border rounded-xl p-4 subpixel-antialiased shadow-sm hover:border-foreground/10 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Role */}
                    <div className="flex items-center gap-2 mb-1 select-none">
                      <h3 className="text-xs font-bold text-foreground tracking-wide truncate">
                        {exp.role}
                      </h3>

                      {exp.isCurrent && (
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <BriefcaseBusiness size={11} className="text-muted-foreground/50" />

                      <p className="text-[11px] font-mono text-muted-foreground">
                        {exp.company}
                      </p>
                    </div>

                    {/* Description */}
                    {exp.description && (
                      <p className="text-[11px] text-muted-foreground font-sans leading-relaxed line-clamp-2 mb-3">
                        {exp.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-muted-foreground/60 select-none">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(exp.startDate)} →{" "}
                        {exp.isCurrent ? "PRESENT" : formatDate(exp.endDate)}
                      </span>

                      <span className="text-muted-foreground/30">•</span>

                      <span>NODE_INDEX {exp.orderIndex}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0 select-none">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(exp.id)}
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
