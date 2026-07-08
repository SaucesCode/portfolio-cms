import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Link as LinkIcon, ImagePlus } from "lucide-react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { toast } from "react-toastify";
import api from "../../services/api";
import TagInput from "../../components/admin/TagInput";
import PublishBadge from "../../components/admin/PublishBadge";
import { useDirtyForm } from "../../hooks/useDirtyForm";

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImageUrl: "",
  tags: [],
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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

export default function BlogEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-blog-post", id],
    queryFn: () => api.get(`/admin/blog/${id}`).then(r => r.data),
    enabled: !isNew,
  });

  const {
    value: form,
    setValue: setForm,
    isDirty,
    markSaved,
    reset,
  } = useDirtyForm(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        slug: existing.slug,
        content: existing.content,
        excerpt: existing.excerpt || "",
        coverImageUrl: existing.coverImageUrl || "",
        tags: existing.tags || [],
      });
      setSlugTouched(true); // don't auto-regenerate the slug of an already-published post
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const update = patch => setForm(prev => ({ ...prev, ...patch }));

  const handleTitleChange = title => {
    update({ title, ...(slugTouched ? {} : { slug: generateSlug(title) }) });
  };

  const handleSave = async (publish = false) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setIsSaving(true);
    try {
      let postId = id;
      if (isNew) {
        const res = await api.post("/admin/blog", form);
        postId = res.data.id;
        toast.success("Draft created");
      } else {
        await api.patch(`/admin/blog/${id}`, form);
        toast.success("Changes saved");
      }
      markSaved();

      if (publish) {
        await api.patch(`/admin/blog/${postId}/publish`);
        toast.success("Published");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });

      if (isNew) navigate(`/admin/blog/${postId}/edit`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't save — try again");
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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/admin/blog")}
          className="flex items-center gap-1.5 text-[12.5px] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={14} />
          Blog
        </button>
        <div className="flex items-center gap-3">
          {!isNew && (
            <PublishBadge
              status={existing?.status}
              scheduledAt={existing?.scheduledAt}
              publishedAt={existing?.publishedAt}
            />
          )}
          <span className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
            {isDirty ? (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--signal-warm, var(--signal))" }}
                />
                Unsaved changes
              </span>
            ) : (
              !isNew && "All changes saved"
            )}
          </span>
        </div>
      </div>

      <h1 className="text-[22px] font-bold tracking-[-0.01em] mb-1">
        {isNew ? "New post" : form.title || "Edit post"}
      </h1>
      <p className="text-[13px] mb-2" style={{ color: "var(--muted-foreground)" }}>
        {isNew
          ? "Drafts stay hidden until you publish."
          : "Saving here does not change publish status — use Publish below."}
      </p>

      <Section
        title="Article"
        description="Title and slug shown in the archive, and the URL visitors use to reach it."
      >
        <Field label="Title">
          <input
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="My awesome blog post"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Slug" hint="Auto-generated from the title until you edit it directly.">
          <div className="relative flex items-center">
            <span
              className="absolute left-3 text-[13px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              /blog/
            </span>
            <input
              value={form.slug}
              onChange={e => {
                setSlugTouched(true);
                update({ slug: e.target.value });
              }}
              className={`${inputClass} pl-[52px]`}
              style={inputStyle}
            />
          </div>
        </Field>
        <Field
          label="Excerpt"
          hint="Shown in the archive list and used for the cover story's drop-cap paragraph."
        >
          <textarea
            value={form.excerpt}
            onChange={e => update({ excerpt: e.target.value })}
            rows={2}
            className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed`}
            style={inputStyle}
          />
        </Field>
        <Field label="Tags">
          <TagInput
            value={form.tags}
            onChange={v => update({ tags: v })}
            placeholder="e.g. React, Performance"
          />
        </Field>
      </Section>

      <Section
        title="Cover image"
        description="Only shown when this post is the featured cover story."
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
            {form.coverImageUrl ? (
              <img src={form.coverImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImagePlus size={20} style={{ color: "var(--muted-foreground)" }} />
            )}
          </div>
          <div className="flex-1">
            <Field label="Image URL">
              <div className="relative">
                <LinkIcon
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  value={form.coverImageUrl}
                  onChange={e => update({ coverImageUrl: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className={`${inputClass} pl-8`}
                  style={inputStyle}
                />
              </div>
            </Field>
          </div>
        </div>
      </Section>

      <div className="py-8">
        <h2 className="text-[14px] font-semibold mb-1">Content</h2>
        <p
          className="text-[12.5px] mb-4 leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          Written in markdown — rendered with syntax-highlighted code blocks on the public post
          page.
        </p>
        <div
          className="rounded-lg overflow-hidden admin-editor"
          style={{ border: "1px solid var(--rule)" }}
        >
          <SimpleMDE
            value={form.content}
            onChange={val => update({ content: val })}
            options={{
              autofocus: false,
              spellChecker: false,
              placeholder: "Write your post...",
              status: false,
            }}
          />
        </div>
      </div>

      <div
        className="sticky bottom-0 mt-2 -mx-6 md:-mx-10 px-6 md:px-10 py-4 flex items-center justify-between gap-3"
        style={{
          background: "color-mix(in oklch, var(--background) 92%, transparent)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid var(--rule)",
        }}
      >
        <button
          onClick={() => navigate("/admin/blog")}
          className="px-4 h-9 rounded-lg text-[12.5px] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Discard
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-3.5 h-9 rounded-lg text-[12.5px] font-medium disabled:opacity-50"
            style={{ border: "1px solid var(--rule)" }}
          >
            Save draft
          </button>
          <button
            onClick={() => handleSave(true)}
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

      <style>{`
        .admin-editor .CodeMirror {
          background: var(--background);
          color: var(--foreground);
          border: none;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
        }
        .admin-editor .editor-toolbar {
          background: var(--card);
          border: none;
          border-bottom: 1px solid var(--rule);
        }
        .admin-editor .editor-toolbar button { color: var(--foreground) !important; }
        .admin-editor .editor-toolbar button.active,
        .admin-editor .editor-toolbar button:hover { background: var(--muted) !important; border-color: transparent !important; }
        .admin-editor .editor-preview { background: var(--background); color: var(--foreground); }
      `}</style>
    </div>
  );
}
