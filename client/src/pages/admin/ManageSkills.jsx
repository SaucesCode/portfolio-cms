import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ChevronUp, ChevronDown, Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { createPublishingApi } from "../../services/publishing";
import { usePublishingActions } from "../../hooks/usePublishingActions";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import StatusTabs from "../../components/admin/StatusTabs";
import PublishBadge from "../../components/admin/PublishBadge";
import PublishMenu from "../../components/admin/PublishMenu";

const CATEGORIES = ["Frontend", "Backend", "Tools", "Other"];
const emptyForm = {
  name: "",
  category: "Frontend",
  proficiencyLevel: 3,
  iconName: "",
  orderIndex: 0,
};

function ProficiencyDots({ level, onChange }) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={`Proficiency ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-label={`Set proficiency to ${n}`}
          className="h-2.5 w-2.5 rounded-full transition-colors"
          style={{ background: n <= level ? "var(--signal)" : "var(--rule)" }}
        />
      ))}
    </div>
  );
}

export default function ManageSkills() {
  const queryClient = useQueryClient();
  const publishingApi = createPublishingApi("/admin/skills");
  const { handleTransition } = usePublishingActions(publishingApi, [
    ["admin-skills"],
    ["skills"],
  ]);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["admin-skills"],
    queryFn: () => api.get("/admin/skills").then(r => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-skills"] });
    queryClient.invalidateQueries({ queryKey: ["skills"] });
  };

  const filtered = useMemo(() => {
    let list = [...skills];
    if (statusFilter !== "All")
      list = list.filter(s => s.status === statusFilter.toUpperCase());
    if (categoryFilter !== "All") list = list.filter(s => s.category === categoryFilter);
    if (query.trim())
      list = list.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    return list.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [skills, statusFilter, categoryFilter, query]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
    if (!form.name.trim()) return toast.error("Name is required");
    try {
      const payload = {
        ...form,
        proficiencyLevel: parseInt(form.proficiencyLevel),
        orderIndex: parseInt(form.orderIndex),
      };
      if (editingId) {
        await api.patch(`/admin/skills/${editingId}`, payload);
        toast.success("Changes saved");
      } else {
        await api.post("/admin/skills", payload);
        toast.success("Skill added as draft — publish it when ready");
      }
      invalidate();
      handleCancel();
    } catch {
      toast.error("Couldn't save — try again");
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this skill? This can't be undone.")) return;
    try {
      await api.delete(`/admin/skills/${id}`);
      toast.success("Skill deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  const handleProficiencyChange = async (skill, level) => {
    try {
      await api.patch(`/admin/skills/${skill.id}`, { proficiencyLevel: level });
      invalidate();
    } catch {
      toast.error("Couldn't update — try again");
    }
  };

  // Manual reorder — swaps orderIndex with the adjacent row, then reuses the shared reorder endpoint
  const handleMove = async (skill, direction) => {
    const sorted = [...skills].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex(s => s.id === skill.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    try {
      await api.patch("/admin/skills/reorder", {
        items: [
          { id: skill.id, orderIndex: other.orderIndex },
          { id: other.id, orderIndex: skill.orderIndex },
        ],
      });
      invalidate();
    } catch {
      toast.error("Couldn't reorder — try again");
    }
  };

  const inputClass = "w-full px-3 h-9 rounded-lg text-[13px] outline-none";
  const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

  return (
    <div>
      <PageHeader
        eyebrow={`${skills.length} total`}
        title="Skills"
        description="The proficiency field on your portfolio's Skills section."
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              <Plus size={14} />
              New skill
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
              <p className="text-[13px] font-semibold mb-4">
                {editingId ? "Edit skill" : "New skill"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. React"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                    style={inputStyle}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">
                    Proficiency — {form.proficiencyLevel}/5
                  </label>
                  <input
                    type="range"
                    name="proficiencyLevel"
                    min="1"
                    max="5"
                    value={form.proficiencyLevel}
                    onChange={handleChange}
                    className="w-full"
                    style={{ accentColor: "var(--signal)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Sort position</label>
                  <input
                    type="number"
                    name="orderIndex"
                    value={form.orderIndex}
                    onChange={handleChange}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
              {!editingId && (
                <p className="text-[11.5px] mb-4" style={{ color: "var(--muted-foreground)" }}>
                  New skills are added as drafts — publish from the list once you're happy with
                  it.
                </p>
              )}
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
                  {editingId ? "Save changes" : "Add skill"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <StatusTabs value={statusFilter} onChange={setStatusFilter} />
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-8 pl-7 pr-3 rounded-lg text-[12.5px] outline-none w-40"
              style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg text-[12.5px] cursor-pointer"
            style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
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
          icon={Wrench}
          title={skills.length === 0 ? "No skills yet" : "Nothing matches this filter"}
          description={
            skills.length === 0
              ? "Add your first skill to see it appear here."
              : "Try a different search or category."
          }
        />
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--rule)" }}
        >
          {/* Column header — this is what makes it read as a table, not cards */}
          <div
            className="hidden md:grid grid-cols-[32px_1.6fr_1fr_1fr_auto] items-center gap-4 px-4 h-9 text-[10.5px] font-semibold uppercase tracking-wider"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            <span />
            <span>Name</span>
            <span>Proficiency</span>
            <span>Status</span>
            <span className="text-right pr-1">Actions</span>
          </div>

          {filtered.map((skill, i) => (
            <div
              key={skill.id}
              className="grid grid-cols-[32px_1fr_auto] md:grid-cols-[32px_1.6fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--muted)]"
              style={{
                background: "var(--card)",
                borderTop: i > 0 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <button
                  onClick={() => handleMove(skill, -1)}
                  disabled={i === 0}
                  className="disabled:opacity-20"
                  style={{ color: "var(--muted-foreground)" }}
                  aria-label="Move up"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => handleMove(skill, 1)}
                  disabled={i === filtered.length - 1}
                  className="disabled:opacity-20"
                  style={{ color: "var(--muted-foreground)" }}
                  aria-label="Move down"
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold truncate">{skill.name}</p>
                <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
                  {skill.category}
                </p>
              </div>

              <ProficiencyDots
                level={skill.proficiencyLevel}
                onChange={n => handleProficiencyChange(skill, n)}
              />

              <PublishBadge
                status={skill.status}
                scheduledAt={skill.scheduledAt}
                publishedAt={skill.publishedAt}
              />

              <div className="flex items-center justify-end gap-0.5">
                <PublishMenu
                  status={skill.status}
                  onAction={(action, payload) => handleTransition(skill, action, payload)}
                />
                <button
                  onClick={() => handleEdit(skill)}
                  className="p-1.5 rounded-md hover:bg-[var(--background)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
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
