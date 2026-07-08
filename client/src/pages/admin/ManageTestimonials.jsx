import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, MessagesSquare, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { createPublishingApi } from "../../services/publishing";
import { usePublishingActions } from "../../hooks/usePublishingActions";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import StatusTabs from "../../components/admin/StatusTabs";
import PublishBadge from "../../components/admin/PublishBadge";
import PublishMenu from "../../components/admin/PublishMenu";

const emptyForm = { name: "", role: "", company: "", avatarUrl: "", quote: "", orderIndex: 0 };

const inputClass = "w-full px-3 h-9 rounded-lg text-[13px] outline-none";
const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

export default function ManageTestimonials() {
  const queryClient = useQueryClient();
  const publishingApi = createPublishingApi("/admin/testimonials");
  const { handleTransition } = usePublishingActions(publishingApi, [
    ["admin-testimonials"],
    ["testimonials"],
  ]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => api.get("/admin/testimonials").then(r => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const filtered = useMemo(() => {
    let list = [...testimonials].sort((a, b) => a.orderIndex - b.orderIndex);
    if (statusFilter !== "All")
      list = list.filter(t => t.status === statusFilter.toUpperCase());
    return list;
  }, [testimonials, statusFilter]);

  const update = patch => setForm(prev => ({ ...prev, ...patch }));

  const handleEdit = t => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role,
      company: t.company,
      avatarUrl: t.avatarUrl || "",
      quote: t.quote,
      orderIndex: t.orderIndex,
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
    if (!form.name.trim() || !form.quote.trim())
      return toast.error("Name and quote are required");

    try {
      const payload = { ...form, orderIndex: parseInt(form.orderIndex) || 0 };
      if (editingId) {
        await api.patch(`/admin/testimonials/${editingId}`, payload);
        toast.success("Changes saved");
      } else {
        await api.post("/admin/testimonials", payload);
        toast.success("Testimonial added as draft — publish it when ready");
      }
      invalidate();
      handleCancel();
    } catch {
      toast.error("Couldn't save — try again");
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this testimonial? This can't be undone.")) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      toast.success("Deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  // Manual reorder — swaps orderIndex with the adjacent row, same pattern as Skills
  const handleMove = async (t, direction) => {
    const sorted = [...testimonials].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex(s => s.id === t.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    try {
      await api.patch("/admin/testimonials/reorder", {
        items: [
          { id: t.id, orderIndex: other.orderIndex },
          { id: other.id, orderIndex: t.orderIndex },
        ],
      });
      invalidate();
    } catch {
      toast.error("Couldn't reorder — try again");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${testimonials.length} total`}
        title="Testimonials"
        description="Shown one at a time in your portfolio's carousel, in this order."
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              <Plus size={14} />
              New testimonial
            </button>
          )
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-6"
          >
            <div
              className="p-5 rounded-lg mb-1"
              style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
            >
              <p className="text-[13px] font-semibold mb-5">
                {editingId ? "Edit testimonial" : "New testimonial"}
              </p>

              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  The quote
                </p>
                <textarea
                  value={form.quote}
                  onChange={e => update({ quote: e.target.value })}
                  placeholder="What did they say about working with you?"
                  rows={3}
                  className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed`}
                  style={inputStyle}
                />
              </div>

              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Attribution
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Name</label>
                    <input
                      value={form.name}
                      onChange={e => update({ name: e.target.value })}
                      placeholder="e.g. Maria Santos"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Role</label>
                    <input
                      value={form.role}
                      onChange={e => update({ role: e.target.value })}
                      placeholder="e.g. Product Manager"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Company</label>
                    <input
                      value={form.company}
                      onChange={e => update({ company: e.target.value })}
                      placeholder="e.g. Tech Startup PH"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Media
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="relative shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      width: 48,
                      height: 48,
                      background: "var(--muted)",
                      border: "1px dashed var(--rule)",
                    }}
                  >
                    {form.avatarUrl ? (
                      <img
                        src={form.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-[13px] font-bold"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {form.name
                          ? form.name
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[12px] font-medium mb-1.5">
                      Avatar URL (optional)
                    </label>
                    <input
                      value={form.avatarUrl}
                      onChange={e => update({ avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {!editingId && (
                <p
                  className="text-[11.5px] mt-4 mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  New testimonials are added as drafts — publish from the list once you're
                  happy with it.
                </p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3.5 h-9 rounded-lg text-[12.5px] font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-9 rounded-lg text-[12.5px] font-semibold"
                  style={{ background: "var(--signal)", color: "var(--background)" }}
                >
                  {editingId ? "Save changes" : "Add testimonial"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <StatusTabs value={statusFilter} onChange={setStatusFilter} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title={
            testimonials.length === 0 ? "No testimonials yet" : "Nothing matches this filter"
          }
          description={
            testimonials.length === 0
              ? "Add your first quote to see it appear here."
              : "Try a different status filter."
          }
        />
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--rule)" }}
        >
          {filtered.map((t, i) => (
            <div
              key={t.id}
              className="flex items-start gap-3.5 px-4 py-4 transition-colors hover:bg-[var(--muted)]"
              style={{
                background: "var(--card)",
                borderTop: i > 0 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                <button
                  onClick={() => handleMove(t, -1)}
                  disabled={i === 0}
                  className="disabled:opacity-20"
                  style={{ color: "var(--muted-foreground)" }}
                  aria-label="Move up"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => handleMove(t, 1)}
                  disabled={i === filtered.length - 1}
                  className="disabled:opacity-20"
                  style={{ color: "var(--muted-foreground)" }}
                  aria-label="Move down"
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              <div
                className="shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                style={{ width: 36, height: 36, background: "var(--muted)" }}
              >
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {t.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-[13.5px] leading-snug line-clamp-2 mb-1.5"
                  style={{ fontStyle: "italic" }}
                >
                  "{t.quote}"
                </p>
                <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {t.name}
                  </span>
                  {" — "}
                  {t.role}
                  {t.company && `, ${t.company}`}
                </p>
              </div>

              <div className="shrink-0 pt-0.5">
                <PublishBadge
                  status={t.status}
                  scheduledAt={t.scheduledAt}
                  publishedAt={t.publishedAt}
                />
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <PublishMenu
                  status={t.status}
                  onAction={(action, payload) => handleTransition(t, action, payload)}
                />
                <button
                  onClick={() => handleEdit(t)}
                  className="p-1.5 rounded-md hover:bg-[var(--background)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-md hover:bg-[var(--background)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
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
