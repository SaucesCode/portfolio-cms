import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";

const emptyForm = { label: "", value: 0, iconName: "" };
const inputClass = "w-full px-3 h-9 rounded-lg text-[13px] outline-none";
const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

export default function ManageStats() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then(r => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const update = patch => setForm(prev => ({ ...prev, ...patch }));

  const handleEdit = stat => {
    setEditingId(stat.id);
    setForm({ label: stat.label, value: stat.value, iconName: stat.iconName || "" });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.label.trim()) return toast.error("Label is required");

    try {
      if (editingId) {
        await api.patch(`/admin/stats/${editingId}`, form);
        toast.success("Changes saved");
      } else {
        await api.post("/admin/stats", form);
        toast.success("Stat added");
      }
      invalidate();
      handleCancel();
    } catch {
      toast.error("Couldn't save — try again");
    }
  };

  const handleDelete = async id => {
    if (
      !window.confirm(
        "Delete this stat? It will disappear from the portfolio's story immediately.",
      )
    )
      return;
    try {
      await api.delete(`/admin/stats/${id}`);
      toast.success("Deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${stats.length} total`}
        title="Stats"
        description="The numbers woven into your portfolio's closing story — always live, never drafted."
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              <Plus size={14} />
              New stat
            </button>
          )
        }
      />

      {/* Live preview of the story sentence — same reasoning as Hero's preview: seeing
          it in context is more useful here than a table ever could be */}
      {stats.length > 0 && (
        <div
          className="mb-6 p-5 rounded-lg"
          style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            How this reads on the site
          </p>
          <p className="text-[15px] leading-relaxed">
            "...it's slowly become{" "}
            {stats.map((s, i) => (
              <span key={s.id}>
                {i > 0 && i === stats.length - 1 ? " and " : i > 0 ? ", " : ""}
                <span className="font-bold" style={{ color: "var(--signal)" }}>
                  {s.value}
                  {s.value >= 10 ? "+" : ""}
                </span>{" "}
                {s.label.toLowerCase()}
              </span>
            ))}{" "}
            — and however this reads to you, I'm not done yet."
          </p>
        </div>
      )}

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
              <p className="text-[13px] font-semibold mb-4">
                {editingId ? "Edit stat" : "New stat"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-medium mb-1.5">Label</label>
                  <input
                    value={form.label}
                    onChange={e => update({ label: e.target.value })}
                    placeholder="e.g. Projects Built"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Value</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={e => update({ value: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
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
                  {editingId ? "Save changes" : "Add stat"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }}
          />
        </div>
      ) : stats.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No stats yet"
          description="Add your first number to start telling the story."
        />
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--rule)" }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.id}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--muted)]"
              style={{
                background: "var(--card)",
                borderTop: i > 0 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div
                className="font-mono text-[18px] font-bold tabular-nums shrink-0 w-16 text-center"
                style={{ color: "var(--signal)" }}
              >
                {stat.value}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold">{stat.label}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => handleEdit(stat)}
                  className="p-1.5 rounded-md hover:bg-[var(--background)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(stat.id)}
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
