import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Star,
  GitFork,
  ImagePlus,
  ExternalLink,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";
import TagInput from "../../components/admin/TagInput";
import PublishBadge from "@/components/admin/PublishBadge";
import PublishMenu from "@/components/admin/PublishMenu";

const emptyForm = {
  title: "",
  description: "",
  techStack: [],
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  githubRepoName: "",
  featured: false,
  orderIndex: 0,
};

function Section({ title, description, children }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-8"
      style={{ borderBottom: "1px solid var(--rule)" }}
    >
      <div>
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {description && (
          <p
            className="text-[12.5px] mt-1 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4 min-w-0">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium mb-1.5">{label}</label>
      {children}
      {hint && (
        <p className="text-[11.5px] mt-1.5" style={{ color: "var(--muted-foreground)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full px-3 h-10 rounded-lg text-[13px] outline-none transition-colors";
const inputStyle = { border: "1px solid var(--rule)", background: "var(--card)" };

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-project", id],
    queryFn: () => api.get(`/admin/projects/${id}`).then(r => r.data),
    enabled: !isNew,
  });

  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (existing) {
      const loaded = {
        title: existing.title,
        description: existing.description,
        techStack: existing.techStack || [],
        imageUrl: existing.imageUrl || "",
        liveUrl: existing.liveUrl || "",
        githubUrl: existing.githubUrl || "",
        githubRepoName: existing.githubRepoName || "",
        featured: existing.featured,
        orderIndex: existing.orderIndex,
      };
      setForm(loaded);
      setInitialForm(loaded);
    }
  }, [existing]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const update = useCallback(patch => setForm(prev => ({ ...prev, ...patch })), []);

  const handleAutoFill = async () => {
    if (!form.githubRepoName.trim()) {
      toast.error("Enter a repo name first");
      return;
    }
    setIsAutoFilling(true);
    try {
      const res = await api.get(`/admin/github/repo/${form.githubRepoName}`);
      const { title, description, language, githubUrl } = res.data;
      update({
        title: form.title || title,
        description: form.description || description,
        githubUrl: githubUrl || form.githubUrl,
        techStack:
          language && !form.techStack.includes(language)
            ? [...form.techStack, language]
            : form.techStack,
      });
      toast.success("Pulled details from GitHub");
    } catch {
      toast.error("Couldn't find that repo");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSave = async (andExit = true) => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...form, orderIndex: parseInt(form.orderIndex) || 0 };
      if (isNew) {
        const res = await api.post("/admin/projects", payload);
        toast.success("Project created");
        queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        if (andExit) navigate("/admin/projects");
        else navigate(`/admin/projects/${res.data.id}/edit`, { replace: true });
      } else {
        await api.patch(`/admin/projects/${id}`, payload);
        toast.success("Changes saved");
        setInitialForm(form);
        queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        if (andExit) navigate("/admin/projects");
      }
    } catch {
      toast.error("Couldn't save — check the fields and try again");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isNew && isLoading) {
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
    <div className="pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/admin/projects")}
          className="flex items-center gap-1.5 text-[12.5px] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={14} />
          Projects
        </button>
        <div
          className="flex items-center gap-2 text-[11.5px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          {isDirty ? (
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--signal-warm, var(--signal))" }}
              />
              Unsaved changes
            </span>
          ) : (
            !isNew && <span>All changes saved</span>
          )}
        </div>
      </div>

      <h1 className="text-[22px] font-bold tracking-[-0.01em] mb-1">
        {isNew ? "New project" : form.title || "Edit project"}
      </h1>
      <p className="text-[13px] mb-2" style={{ color: "var(--muted-foreground)" }}>
        {isNew
          ? "Add a project to your portfolio's Work section."
          : "Changes go live the moment you save."}
      </p>

      {/* Overview */}
      <Section
        title="Overview"
        description="The title and description shown on your Work section and its detail view."
      >
        <Field label="Title">
          <input
            value={form.title}
            onChange={e => update({ title: e.target.value })}
            placeholder="e.g. QuickAid Geomapping"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="What does this project do, and what problem does it solve?"
            rows={4}
            className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed`}
            style={inputStyle}
          />
        </Field>
        <Field label="Technologies" hint="Press Enter or comma to add each one.">
          <TagInput
            value={form.techStack}
            onChange={v => update({ techStack: v })}
            placeholder="e.g. React, Node.js, PostgreSQL"
          />
        </Field>
      </Section>

      {/* Media */}
      <Section
        title="Cover image"
        description="Shown as the thumbnail in listings and the detail view."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className="relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              width: 160,
              height: 100,
              background: "var(--muted)",
              border: "1px dashed var(--rule)",
            }}
          >
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImagePlus size={20} style={{ color: "var(--muted-foreground)" }} />
            )}
          </div>
          <div className="flex-1">
            <Field
              label="Image URL"
              hint="Paste a hosted image link — drag-and-drop upload will land here once file storage is wired up."
            >
              <input
                value={form.imageUrl}
                onChange={e => update({ imageUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Links + GitHub */}
      <Section title="Links" description="Where visitors go when they click through.">
        <Field label="Live URL">
          <div className="relative">
            <input
              value={form.liveUrl}
              onChange={e => update({ liveUrl: e.target.value })}
              placeholder="https://yourproject.com"
              className={`${inputClass} pr-9`}
              style={inputStyle}
            />
            {form.liveUrl && (
              <a
                href={form.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </Field>
        <Field label="GitHub repository URL">
          <input
            value={form.githubUrl}
            onChange={e => update({ githubUrl: e.target.value })}
            placeholder="https://github.com/you/repo"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <div className="pt-2">
          <Field
            label="GitHub repo name"
            hint="Used to pull live stars, forks, and language — and to keep GitHub sync in the Projects list working."
          >
            <div className="flex gap-2">
              <input
                value={form.githubRepoName}
                onChange={e => update({ githubRepoName: e.target.value })}
                placeholder="e.g. QuickAid-Geomapping"
                className={`${inputClass} flex-1`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="flex items-center gap-1.5 px-3.5 h-10 rounded-lg text-[12.5px] font-medium shrink-0 disabled:opacity-50"
                style={{ border: "1px solid var(--rule)" }}
              >
                <Sparkles size={13} className={isAutoFilling ? "animate-pulse" : ""} />
                {isAutoFilling ? "Pulling..." : "Auto-fill"}
              </button>
            </div>
          </Field>
          {!isNew && existing?.githubSyncedAt && (
            <p
              className="flex items-center gap-3 mt-3 text-[11.5px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {existing.stars != null && (
                <span className="flex items-center gap-1">
                  <Star size={11} />
                  {existing.stars}
                </span>
              )}
              {existing.forks != null && (
                <span className="flex items-center gap-1">
                  <GitFork size={11} />
                  {existing.forks}
                </span>
              )}
              <span>Synced {new Date(existing.githubSyncedAt).toLocaleDateString()}</span>
            </p>
          )}
        </div>
      </Section>

      <Section
        title="Publishing"
        description="Controls whether and when this project appears on the live site."
      >
        <div
          className="flex items-center justify-between gap-4 px-3.5 h-11 rounded-lg"
          style={{ border: "1px solid var(--rule)" }}
        >
          <div>
            <p className="text-[13px] font-medium">Current status</p>
            {!isNew && (
              <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
                Last updated{" "}
                {new Date(existing?.updatedAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          {!isNew && (
            <PublishBadge
              status={existing?.status}
              scheduledAt={existing?.scheduledAt}
              publishedAt={existing?.publishedAt}
            />
          )}
        </div>

        <div
          className="flex items-center justify-between gap-4 px-3.5 h-11 rounded-lg"
          style={{ border: "1px solid var(--rule)" }}
        >
          <div>
            <p className="text-[13px] font-medium">Feature this project</p>
            <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
              Featured projects are visually highlighted in your Work section.
            </p>
          </div>
          <button
            type="button"
            onClick={() => update({ featured: !form.featured })}
            className="relative w-9 h-5 rounded-full shrink-0 transition-colors"
            style={{ background: form.featured ? "var(--signal)" : "var(--muted)" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform"
              style={{
                background: "var(--background)",
                transform: form.featured ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </button>
        </div>

        <Field
          label="Sort position"
          hint="Lower numbers appear first. Ties break by creation date."
        >
          <input
            type="number"
            value={form.orderIndex}
            onChange={e => update({ orderIndex: e.target.value })}
            className={`${inputClass} w-32`}
            style={inputStyle}
          />
        </Field>
      </Section>

      {/* Sticky action bar */}
      <div
        className="sticky bottom-0 mt-2 -mx-6 md:-mx-10 px-6 md:px-10 py-4 flex items-center justify-between gap-3"
        style={{
          background: "color-mix(in oklch, var(--background) 92%, transparent)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid var(--rule)",
        }}
      >
        <button
          onClick={() => navigate("/admin/projects")}
          className="px-4 h-9 rounded-lg text-[12.5px] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Discard
        </button>
        <div className="flex items-center gap-2">
          {isNew && (
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-3.5 h-9 rounded-lg text-[12.5px] font-medium disabled:opacity-50"
              style={{ border: "1px solid var(--rule)" }}
            >
              Save & keep editing
            </button>
          )}
          <button
            onClick={async () => {
              await handleSave(false); // persist field edits first
              if (!isNew) {
                try {
                  await api.patch(`/admin/projects/${id}/publish`);
                  toast.success("Published");
                  navigate("/admin/projects");
                } catch {
                  toast.error("Couldn't publish — try again");
                }
              } else {
                navigate("/admin/projects");
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--signal)", color: "var(--background)" }}
          >
            <Check size={14} />
            {isSaving
              ? "Saving..."
              : existing?.status === "PUBLISHED"
                ? "Update"
                : "Save & publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
