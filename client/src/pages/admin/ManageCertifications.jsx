import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ChevronDown, ExternalLink, Pencil, Trash2, Award, X, ImagePlus } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { createPublishingApi } from "../../services/publishing";
import { usePublishingActions } from "../../hooks/usePublishingActions";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import StatusTabs from "../../components/admin/StatusTabs";
import PublishBadge from "../../components/admin/PublishBadge";
import PublishMenu from "../../components/admin/PublishMenu";

const SORTS = [
  { id: "order", label: "Manual order" },
  { id: "recent", label: "Most recently issued" },
  { id: "oldest", label: "Oldest first" },
  { id: "name", label: "Name (A–Z)" },
];

const emptyForm = { name: "", issuer: "", issueDate: "", credentialUrl: "", badgeImageUrl: "", orderIndex: 0 };

function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const inputClass = "w-full px-3 h-9 rounded-lg text-[13px] outline-none";
const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

export default function ManageCertifications() {
  const queryClient = useQueryClient();
  const publishingApi = createPublishingApi("/admin/certifications");
  const { handleTransition } = usePublishingActions(publishingApi, [["admin-certifications"], ["certifications"]]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: () => api.get("/admin/certifications").then(r => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
    queryClient.invalidateQueries({ queryKey: ["certifications"] });
  };

  const filtered = useMemo(() => {
    let list = [...certifications];
    if (statusFilter !== "All") list = list.filter(c => c.status === statusFilter.toUpperCase());
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
    }
    switch (sort) {
      case "recent":
        list.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return list;
  }, [certifications, statusFilter, query, sort]);

  const toggleSelect = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const update = patch => setForm(prev => ({ ...prev, ...patch }));

  const handleEdit = cert => {
    setEditingId(cert.id);
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: toInputDate(cert.issueDate),
      credentialUrl: cert.credentialUrl || "",
      badgeImageUrl: cert.badgeImageUrl || "",
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
    if (!form.name.trim() || !form.issuer.trim()) return toast.error("Name and issuer are required");
    if (!form.issueDate) return toast.error("Issue date is required");

    try {
      const payload = { ...form, orderIndex: parseInt(form.orderIndex) || 0 };
      if (editingId) {
        await api.patch(`/admin/certifications/${editingId}`, payload);
        toast.success("Changes saved");
      } else {
        await api.post("/admin/certifications", payload);
        toast.success("Certification added as draft — publish it when ready");
      }
      invalidate();
      handleCancel();
    } catch {
      toast.error("Couldn't save — try again");
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this certification? This can't be undone.")) return;
    try {
      await api.delete(`/admin/certifications/${id}`);
      toast.success("Deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} certification${selected.size !== 1 ? "s" : ""}? This can't be undone.`)) return;
    try {
      await Promise.all([...selected].map(id => api.delete(`/admin/certifications/${id}`)));
      toast.success(`Deleted ${selected.size} item${selected.size !== 1 ? "s" : ""}`);
      setSelected(new Set());
      invalidate();
    } catch {
      toast.error("Some deletions failed — refresh and check");
    }
  };

  const handleBulkTransition = async action => {
    try {
      await Promise.all(
        [...selected].map(id => (action === "publish" ? publishingApi.publish(id) : publishingApi.archive(id))),
      );
      toast.success(action === "publish" ? "Published selected" : "Archived selected");
      setSelected(new Set());
      invalidate();
    } catch {
      toast.error("Some updates failed — refresh and check");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${certifications.length} total`}
        title="Certifications"
        description="Credentials shown in your portfolio's Skills & Certifications tab."
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              <Plus size={14} />
              New certification
            </button>
          )
        }
      />

      {/* Sectioned editor — Certification / Dates / Media, exactly as requested */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-6"
          >
            <div className="p-5 rounded-lg mb-1" style={{ border: "1px solid var(--rule)", background: "var(--card)" }}>
              <p className="text-[13px] font-semibold mb-5">{editingId ? "Edit certification" : "New certification"}</p>

              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Certification
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Name</label>
                    <input value={form.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. AWS Certified Developer" className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Issuer</label>
                    <input value={form.issuer} onChange={e => update({ issuer: e.target.value })} placeholder="e.g. Amazon Web Services" className={inputClass} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Dates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Issue date</label>
                    <input type="date" value={form.issueDate} onChange={e => update({ issueDate: e.target.value })} className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Sort position</label>
                    <input type="number" value={form.orderIndex} onChange={e => update({ orderIndex: e.target.value })} className={inputClass} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Media
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div
                    className="relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ width: 80, height: 80, background: "var(--muted)", border: "1px dashed var(--rule)" }}
                  >
                    {form.badgeImageUrl ? (
                      <img src={form.badgeImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={18} style={{ color: "var(--muted-foreground)" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[12px] font-medium mb-1.5">Badge image URL</label>
                    <input value={form.badgeImageUrl} onChange={e => update({ badgeImageUrl: e.target.value })} placeholder="https://example.com/badge.png" className={inputClass} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Credential URL</label>
                  <input value={form.credentialUrl} onChange={e => update({ credentialUrl: e.target.value })} placeholder="https://credential.link/verify/123" className={inputClass} style={inputStyle} />
                </div>
              </div>

              {!editingId && (
                <p className="text-[11.5px] mt-4 mb-2" style={{ color: "var(--muted-foreground)" }}>
                  New certifications are added as drafts — publish from the list once you're happy with it.
                </p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleCancel} className="px-3.5 h-9 rounded-lg text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                  Cancel
                </button>
                <button type="submit" className="px-4 h-9 rounded-lg text-[12.5px] font-semibold" style={{ background: "var(--signal)", color: "var(--background)" }}>
                  {editingId ? "Save changes" : "Add certification"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <StatusTabs value={statusFilter} onChange={setStatusFilter} />
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-8 pl-7 pr-3 rounded-lg text-[12.5px] outline-none w-40"
              style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setSortMenuOpen(p => !p)}
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-[12.5px]"
              style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
            >
              {SORTS.find(s => s.id === sort)?.label}
              <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <AnimatePresence>
              {sortMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1.5 w-48 rounded-lg overflow-hidden z-20"
                    style={{ background: "var(--card)", border: "1px solid var(--rule)", boxShadow: "0 8px 24px -8px rgba(0,0,0,0.15)" }}
                  >
                    {SORTS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSort(s.id);
                          setSortMenuOpen(false);
                        }}
                        className="w-full text-left px-3 h-9 text-[12.5px] transition-colors hover:bg-[var(--muted)]"
                        style={{ color: sort === s.id ? "var(--signal)" : "var(--foreground)" }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bulk action bar — future-ready, present but quiet until used */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div
              className="flex items-center justify-between gap-3 px-4 h-11 rounded-lg"
              style={{ background: "color-mix(in oklch, var(--signal) 8%, transparent)", border: "1px solid var(--signal)" }}
            >
              <span className="text-[12.5px] font-medium" style={{ color: "var(--signal)" }}>
                {selected.size} selected
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => handleBulkTransition("publish")} className="px-2.5 h-7 rounded-md text-[12px] font-medium hover:bg-[var(--muted)]">
                  Publish
                </button>
                <button onClick={() => handleBulkTransition("archive")} className="px-2.5 h-7 rounded-md text-[12px] font-medium hover:bg-[var(--muted)]">
                  Archive
                </button>
                <button onClick={handleBulkDelete} className="px-2.5 h-7 rounded-md text-[12px] font-medium hover:bg-[var(--muted)]" style={{ color: "#c0392b" }}>
                  Delete
                </button>
                <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-md hover:bg-[var(--muted)]" aria-label="Clear selection">
                  <X size={13} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Award}
          title={certifications.length === 0 ? "No certifications yet" : "Nothing matches this filter"}
          description={certifications.length === 0 ? "Add your first credential to see it appear here." : "Try a different search or status."}
        />
      ) : (
        // The archive — a wall of credentials, not a data table. Badge thumbnail leads every row.
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {filtered.map((cert, i) => (
            <div
              key={cert.id}
              className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[var(--muted)]"
              style={{ background: "var(--card)", borderTop: i > 0 ? "1px solid var(--rule)" : "none" }}
            >
              <input
                type="checkbox"
                checked={selected.has(cert.id)}
                onChange={() => toggleSelect(cert.id)}
                className="h-4 w-4 shrink-0 cursor-pointer"
                style={{ accentColor: "var(--signal)" }}
                aria-label={`Select ${cert.name}`}
              />

              <div
                className="shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ width: 40, height: 40, background: "var(--muted)" }}
              >
                {cert.badgeImageUrl ? (
                  <img src={cert.badgeImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Award size={16} style={{ color: "var(--muted-foreground)" }} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-[13.5px] font-semibold truncate">{cert.name}</h3>
                <p className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                  {cert.issuer} · Issued {formatDate(cert.issueDate)}
                </p>
              </div>

              <div className="hidden sm:block shrink-0">
                <PublishBadge status={cert.status} scheduledAt={cert.scheduledAt} publishedAt={cert.publishedAt} />
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-[var(--background)]"
                    style={{ color: "var(--muted-foreground)" }}
                    title="View credential"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
                <PublishMenu status={cert.status} onAction={(action, payload) => handleTransition(cert, action, payload)} />
                <button onClick={() => handleEdit(cert)} className="p-1.5 rounded-md hover:bg-[var(--background)]" style={{ color: "var(--muted-foreground)" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(cert.id)} className="p-1.5 rounded-md hover:bg-[var(--background)]" style={{ color: "var(--muted-foreground)" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}