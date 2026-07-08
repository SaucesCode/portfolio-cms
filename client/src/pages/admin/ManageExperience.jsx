import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { createPublishingApi } from "../../services/publishing";
import { usePublishingActions } from "../../hooks/usePublishingActions";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import StatusTabs from "../../components/admin/StatusTabs";
import PublishBadge from "../../components/admin/PublishBadge";
import PublishMenu from "../../components/admin/PublishMenu";
import DateRangeField from "../../components/admin/DateRangeField";

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

function formatMonth(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const inputClass = "w-full px-3 h-9 rounded-lg text-[13px] outline-none";
const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

export default function ManageExperience() {
  const queryClient = useQueryClient();
  const publishingApi = createPublishingApi("/admin/experiences");
  const { handleTransition } = usePublishingActions(publishingApi, [
    ["admin-experiences"],
    ["experiences"],
  ]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: () => api.get("/admin/experiences").then(r => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
    queryClient.invalidateQueries({ queryKey: ["experiences"] });
  };

  const filtered = useMemo(() => {
    let list = [...experiences];
    if (statusFilter !== "All")
      list = list.filter(e => e.status === statusFilter.toUpperCase());
    return list; // API already returns current-first, reverse-chronological
  }, [experiences, statusFilter]);

  const current = filtered.find(e => e.isCurrent);
  const past = filtered.filter(e => !e.isCurrent);

  const update = patch => setForm(prev => ({ ...prev, ...patch }));

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
    if (!form.company.trim() || !form.role.trim())
      return toast.error("Company and role are required");
    if (!form.startDate) return toast.error("Start date is required");

    if (form.isCurrent && current && current.id !== editingId) {
      const proceed = window.confirm(
        `${current.role} at ${current.company} is currently marked as your current role. Marking this one as current will move that one to your past roles. Continue?`,
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex) || 0,
        endDate: form.isCurrent ? null : form.endDate || null,
      };
      if (editingId) {
        await api.patch(`/admin/experiences/${editingId}`, payload);
        toast.success("Changes saved");
      } else {
        await api.post("/admin/experiences", payload);
        toast.success("Role added as draft — publish it when ready");
      }
      invalidate();
      handleCancel();
    } catch {
      toast.error("Couldn't save — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this role? This can't be undone.")) return;
    try {
      await api.delete(`/admin/experiences/${id}`);
      toast.success("Deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`${experiences.length} total`}
        title="Experience"
        description="Your career timeline, shown reverse-chronologically — current role always leads. Ties break by sort position, not manual drag."
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              <Plus size={14} />
              New role
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
                {editingId ? "Edit role" : "New role"}
              </p>

              {/* Section: Position */}
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Position
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5">Role</label>
                    <input
                      value={form.role}
                      onChange={e => update({ role: e.target.value })}
                      placeholder="e.g. Frontend Developer"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => update({ description: e.target.value })}
                    placeholder="What did you build, own, or lead in this role?"
                    rows={3}
                    className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed`}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Section: Timeline */}
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Timeline
                </p>
                <DateRangeField
                  startDate={form.startDate}
                  endDate={form.endDate}
                  isCurrent={form.isCurrent}
                  onChange={update}
                />
              </div>

              {/* Section: Ordering — explicit about how ties are broken */}
              <div className="mb-2">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Ordering
                </p>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Sort position</label>
                  <input
                    type="number"
                    value={form.orderIndex}
                    onChange={e => update({ orderIndex: e.target.value })}
                    className={`${inputClass} w-32`}
                    style={inputStyle}
                  />
                  <p
                    className="text-[11.5px] mt-1.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Roles are ordered by date automatically. This only breaks a tie if two
                    roles share the same start date.
                  </p>
                </div>
              </div>

              {!editingId && (
                <p
                  className="text-[11.5px] mt-4 mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  New roles are added as drafts — publish from the list once you're happy with
                  it.
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
                  disabled={isSubmitting}
                  className="px-4 h-9 rounded-lg text-[12.5px] font-semibold disabled:opacity-50"
                  style={{ background: "var(--signal)", color: "var(--background)" }}
                >
                  {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Add role"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mb-5">
        <StatusTabs value={statusFilter} onChange={setStatusFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            experiences.length === 0
              ? "No experience logged yet"
              : "Nothing matches this filter"
          }
          description={
            experiences.length === 0
              ? "Add your first role to start building your timeline."
              : "Try a different status filter."
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Current role — the active chapter, not a badge on a row */}
          {current && (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Current
              </p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 p-5 rounded-lg"
                style={{
                  border: "1px solid var(--signal)",
                  background: "color-mix(in oklch, var(--signal) 5%, var(--card))",
                }}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-bold mb-1">{current.role}</h3>
                  <p
                    className="text-[13px] font-medium mb-2"
                    style={{ color: "var(--signal)" }}
                  >
                    {current.company}
                  </p>
                  <p
                    className="text-[12.5px] leading-relaxed mb-3 max-w-[560px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {current.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11.5px] font-mono"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Since {formatMonth(current.startDate)}
                    </span>
                    <PublishBadge
                      status={current.status}
                      scheduledAt={current.scheduledAt}
                      publishedAt={current.publishedAt}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <PublishMenu
                    status={current.status}
                    onAction={(action, payload) => handleTransition(current, action, payload)}
                  />
                  <button
                    onClick={() => handleEdit(current)}
                    className="p-1.5 rounded-md hover:bg-[var(--background)]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(current.id)}
                    className="p-1.5 rounded-md hover:bg-[var(--background)]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Past roles — a quiet, compact log; recedes on purpose */}
          {past.length > 0 && (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Previously
              </p>
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--rule)" }}
              >
                {past.map((exp, i) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--muted)]"
                    style={{
                      background: "var(--card)",
                      borderTop: i > 0 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-[13.5px] font-semibold truncate">{exp.role}</h3>
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          — {exp.company}
                        </span>
                      </div>
                      <p
                        className="text-[11.5px] font-mono mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {formatMonth(exp.startDate)} – {formatMonth(exp.endDate)}
                      </p>
                    </div>
                    <PublishBadge
                      status={exp.status}
                      scheduledAt={exp.scheduledAt}
                      publishedAt={exp.publishedAt}
                    />
                    <div className="flex items-center gap-0.5 shrink-0">
                      <PublishMenu
                        status={exp.status}
                        onAction={(action, payload) => handleTransition(exp, action, payload)}
                      />
                      <button
                        onClick={() => handleEdit(exp)}
                        className="p-1.5 rounded-md hover:bg-[var(--background)]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-md hover:bg-[var(--background)]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
