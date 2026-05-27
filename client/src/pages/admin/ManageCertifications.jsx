import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Award, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const emptyForm = {
  name: "",
  issuer: "",
  issueDate: "",
  credentialUrl: "",
  orderIndex: 0,
};

function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ManageCertifications() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: () => api.get("/admin/certifications").then(res => res.data),
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = cert => {
    setEditingId(cert.id);
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: toInputDate(cert.issueDate),
      credentialUrl: cert.credentialUrl || "",
      orderIndex: cert.orderIndex,
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

    if (!form.name.trim() || !form.issuer.trim()) {
      toast.error("Name and issuer are required");
      return;
    }
    if (!form.issueDate) {
      toast.error("Issue date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex) || 0,
      };

      if (editingId) {
        await api.patch(`/admin/certifications/${editingId}`, payload);
        toast.success("Certification updated");
      } else {
        await api.post("/admin/certifications", payload);
        toast.success("Certification added");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      handleCancel();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this certification?")) return;
    try {
      await api.delete(`/admin/certifications/${id}`);
      toast.success("Certification deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const inputClass = `
    w-full px-3.5 h-10 rounded-lg text-xs font-mono
    bg-neutral-950 border border-border
    text-white placeholder:text-neutral-600
    focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
    transition-all duration-150
  `;

  return (
    <div className="w-full max-w-7xl mx-auto selection:bg-primary/10 selection:text-primary px-2">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border select-none">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground">
            Credentials & Achievements
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground mt-1">
            {certifications.length} {certifications.length === 1 ? "node" : "nodes"} verified
            inside system telemetry
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus size={13} />
            Append Record
          </button>
        )}
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 select-none">
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {editingId ? "Modify Existing Parameters" : "Initialize New Record"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-4">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 select-none">
                    Certification Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. AWS Certified Developer"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-3">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 select-none">
                    Issuing Organization
                  </label>
                  <input
                    name="issuer"
                    value={form.issuer}
                    onChange={handleChange}
                    placeholder="e.g. Amazon Web Services"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-3">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 select-none">
                    Issue Timestamp
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 select-none">
                    Display Index
                  </label>
                  <input
                    type="number"
                    name="orderIndex"
                    value={form.orderIndex}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-12">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 select-none">
                    Verification Endpoint Link (Optional)
                  </label>
                  <input
                    name="credentialUrl"
                    value={form.credentialUrl}
                    onChange={handleChange}
                    placeholder="https://credential.link/verify/123"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40 select-none">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3.5 h-9 text-neutral-400 hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-3.5 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-sm"
                >
                  <Check size={12} />
                  {isSubmitting
                    ? "Committing..."
                    : editingId
                      ? "Commit Changes"
                      : "Push Record"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Stream */}
      {isLoading ? (
        <div className="flex justify-center py-24 select-none">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <Award size={24} className="mx-auto text-muted-foreground/30 mb-2 stroke-[1.5]" />
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            No certifications logged inside data streams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 w-full">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group relative bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-all duration-150"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Accent Icon badge */}
                <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-border flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-amber-400 group-hover:border-amber-500/20 transition-colors select-none">
                  <Award size={15} className="stroke-[1.5]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate">
                    {cert.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-neutral-500 mt-0.5">
                    <span className="text-neutral-400 font-medium">{cert.issuer}</span>
                    <span className="text-neutral-700 select-none">•</span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      {formatDate(cert.issueDate)}
                    </span>
                    {cert.credentialUrl && (
                      <>
                        <span className="text-neutral-700 select-none">•</span>
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                        >
                          Verify <ExternalLink size={10} className="ml-0.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Interface Operations Block */}
              <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity select-none">
                <button
                  onClick={() => handleEdit(cert)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-border rounded-lg transition-all cursor-pointer"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
