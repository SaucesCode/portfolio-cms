import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Award,
  ExternalLink,
  Calendar,
  Layers,
  Link45deg,
} from "lucide-react";
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
    w-full px-3.5 py-2.5 rounded-xl text-sm
    bg-gray-900/50 border border-white/10
    text-white placeholder:text-gray-600
    focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30
    transition-all duration-200
  `;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Certifications</h1>
          <p className="text-gray-400 text-xs mt-1">
            {certifications.length}{" "}
            {certifications.length === 1 ? "credential" : "credentials"} listed
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/10 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus size={15} />
            Add New
          </button>
        )}
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-gray-950 border border-white/5 rounded-2xl p-6 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {editingId ? "Modify Certificate" : "New Certificate"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Display Order Index
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
                  <label className="text-xs font-medium text-gray-400">
                    Verification URL (Optional)
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-400 hover:text-white text-xs font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <Check size={14} />
                  {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Stream */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-gray-950/20">
          <Award size={24} className="mx-auto text-gray-600 mb-2 stroke-[1.5]" />
          <p className="text-gray-500 text-xs">No certifications logged in the database.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group relative bg-gray-950/40 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-gray-950/80 hover:border-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Accent Icon badge */}
                <div className="w-9 h-9 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
                  <Award size={16} className="stroke-[1.75]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white tracking-wide truncate">
                    {cert.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400 mt-0.5">
                    <span className="text-gray-300 font-medium">{cert.issuer}</span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      {formatDate(cert.issueDate)}
                    </span>
                    {cert.credentialUrl && (
                      <>
                        <span className="text-gray-600">•</span>
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-blue-400/80 hover:text-blue-400 font-medium"
                        >
                          Verify <ExternalLink size={10} className="ml-0.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action standard interface */}
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(cert)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
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
