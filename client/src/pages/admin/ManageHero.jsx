import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Plus,
  X,
  GripVertical,
  User as UserIcon,
  FileText,
  ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import PageHeader from "../../components/admin/PageHeader";
import { useDirtyForm } from "../../hooks/useDirtyForm";

const emptyHero = {
  name: "",
  bio: "",
  tagline: [],
  profileImageUrl: "",
  resumeUrl: "",
  availableForWork: true,
};

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
    >
      <div className="flex items-start gap-2.5 mb-5">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          <Icon size={14} />
        </div>
        <div>
          <h2 className="text-[13.5px] font-semibold">{title}</h2>
          {description && (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
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
const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

/* ── Tagline editor — each line is a real editable row, reorderable, keyboard-first ── */
function TaglineEditor({ taglines, onChange }) {
  const draftRef = useRef(null);

  const updateAt = (i, val) => {
    const next = [...taglines];
    next[i] = val;
    onChange(next);
  };

  const removeAt = i => onChange(taglines.filter((_, idx) => idx !== i));

  const addOne = () => {
    onChange([...taglines, ""]);
    requestAnimationFrame(() => draftRef.current?.focus());
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= taglines.length) return;
    const next = [...taglines];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {taglines.map((tag, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 overflow-hidden"
          >
            <div
              className="flex flex-col shrink-0"
              style={{ color: "var(--muted-foreground)" }}
            >
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="disabled:opacity-20"
                aria-label="Move up"
              >
                <GripVertical size={13} />
              </button>
            </div>
            <input
              ref={i === taglines.length - 1 ? draftRef : undefined}
              value={tag}
              onChange={e => updateAt(i, e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOne();
                }
              }}
              placeholder="e.g. Full-Stack Developer"
              className={`${inputClass} flex-1`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="p-1.5 rounded-md hover:bg-[var(--muted)] shrink-0"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="Remove tagline"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={addOne}
        className="flex items-center gap-1.5 mt-1 px-3 h-9 rounded-lg text-[12.5px] font-medium self-start transition-colors hover:bg-[var(--muted)]"
        style={{ border: "1px dashed var(--rule)", color: "var(--muted-foreground)" }}
      >
        <Plus size={13} />
        Add tagline
      </button>
      <p className="text-[11.5px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
        These rotate in the Hero's typewriter effect, in this order. Press Enter to add
        another.
      </p>
    </div>
  );
}

/* ── Compact live preview — approximates the real Hero, not pixel-perfect ── */
function HeroPreview({ hero }) {
  const taglines = hero.tagline.filter(Boolean);
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
      <div
        className="px-4 h-9 flex items-center text-[11px] font-medium"
        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
      >
        Preview — public Hero section
      </div>
      <div className="p-6" style={{ background: "#121316" }}>
        <div className="grid grid-cols-[1fr_auto] gap-5 items-start">
          <div className="min-w-0">
            {hero.availableForWork && (
              <div
                className="inline-flex items-center gap-1.5 mb-3 px-2 h-5 rounded-full"
                style={{ border: "1px solid #2a2b2f" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#c99a4d" }} />
                <span className="text-[9px] font-semibold" style={{ color: "#c99a4d" }}>
                  Available
                </span>
              </div>
            )}
            <h3
              className="font-black leading-[0.98] tracking-tight text-[#ecebe5]"
              style={{ fontSize: "22px" }}
            >
              {hero.name || "Your name"}
            </h3>
            <p
              className="mt-2 text-[11px] leading-relaxed line-clamp-3"
              style={{ color: "#8c8b84" }}
            >
              {hero.bio ||
                "Your bio will appear here — a short description visitors see first."}
            </p>
            <p className="mt-3 text-[10.5px] font-mono truncate" style={{ color: "#5a6bc4" }}>
              {taglines[0] || "your tagline here"}
            </p>
          </div>
          <div
            className="w-16 h-20 rounded overflow-hidden shrink-0"
            style={{ background: "#1c1d21", border: "1px solid #2a2b2f" }}
          >
            {hero.profileImageUrl ? (
              <img
                src={hero.profileImageUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={e => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon size={16} style={{ color: "#63625b" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageHero() {
  const queryClient = useQueryClient();
  const {
    value: form,
    setValue: setForm,
    isDirty,
    markSaved,
    reset,
  } = useDirtyForm(emptyHero);
  const update = patch => setForm(prev => ({ ...prev, ...patch }));

  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  function useSaveState() {} // placeholder removed below — see note

  const { data: hero, isLoading } = useQuery({
    queryKey: ["hero"],
    queryFn: () => api.get("/hero").then(res => res.data),
  });

  useEffect(() => {
    if (hero) {
      reset({
        name: hero.name || "",
        bio: hero.bio || "",
        tagline: hero.tagline || [],
        profileImageUrl: hero.profileImageUrl || "",
        resumeUrl: hero.resumeUrl || "",
        availableForWork: hero.availableForWork ?? true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      await api.patch("/admin/hero", { ...form, tagline: form.tagline.filter(t => t.trim()) });
      toast.success("Hero section updated");
      markSaved();
      queryClient.invalidateQueries({ queryKey: ["hero"] });
    } catch {
      toast.error("Something went wrong — try again");
    } finally {
      setIsSaving(false);
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
    <form onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="Singleton · Public profile"
        title="Hero"
        description="What visitors see first, at the top of your portfolio."
        action={
          <div className="flex items-center gap-3">
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
                "All changes saved"
              )}
            </span>
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--signal)", color: "var(--background)" }}
            >
              {isSaving ? (
                <>
                  <span
                    className="w-3 h-3 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: "color-mix(in oklch, var(--background) 40%, transparent)",
                      borderTopColor: "var(--background)",
                    }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={13} />
                  Save changes
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left — the editable sections */}
        <div className="flex flex-col gap-5">
          <SectionCard
            icon={UserIcon}
            title="Identity"
            description="Your name and current availability signal."
          >
            <Field label="Name">
              <input
                value={form.name}
                onChange={e => update({ name: e.target.value })}
                placeholder="Your full name"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <div
              className="flex items-center justify-between gap-4 px-3.5 h-11 rounded-lg"
              style={{ border: "1px solid var(--rule)" }}
            >
              <div>
                <p className="text-[13px] font-medium">Available for work</p>
                <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
                  Shows a pulsing badge in your nav and Hero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => update({ availableForWork: !form.availableForWork })}
                className="relative w-9 h-5 rounded-full shrink-0 transition-colors"
                style={{
                  background: form.availableForWork ? "var(--signal)" : "var(--muted)",
                }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform"
                  style={{
                    background: "var(--background)",
                    transform: form.availableForWork ? "translateX(16px)" : "translateX(0)",
                  }}
                />
              </button>
            </div>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Hero copy"
            description="The taglines that rotate, and the bio underneath your name."
          >
            <Field label="Taglines">
              <TaglineEditor taglines={form.tagline} onChange={v => update({ tagline: v })} />
            </Field>
            <Field
              label="Bio"
              hint="A few sentences — this is the first thing visitors read about you."
            >
              <textarea
                value={form.bio}
                onChange={e => update({ bio: e.target.value })}
                placeholder="I build fast, beautiful web apps that solve real problems..."
                rows={4}
                className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed`}
                style={inputStyle}
              />
            </Field>
          </SectionCard>

          <SectionCard
            icon={ImageIcon}
            title="Assets"
            description="Your profile photo and downloadable résumé."
          >
            <Field label="Profile image">
              <div className="flex gap-4">
                <div
                  className="relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    width: 96,
                    height: 120,
                    background: "var(--muted)",
                    border: "1px dashed var(--rule)",
                  }}
                >
                  {form.profileImageUrl ? (
                    <img
                      src={form.profileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => (e.target.style.display = "none")}
                    />
                  ) : (
                    <UserIcon size={20} style={{ color: "var(--muted-foreground)" }} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    value={form.profileImageUrl}
                    onChange={e => update({ profileImageUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p
                    className="text-[11.5px] mt-1.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Shown at 4:5 in your Hero section's photo plate.
                  </p>
                </div>
              </div>
            </Field>
            <Field label="Résumé URL">
              <input
                value={form.resumeUrl}
                onChange={e => update({ resumeUrl: e.target.value })}
                placeholder="https://example.com/resume.pdf"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
          </SectionCard>
        </div>

        {/* Right — sticky live preview */}
        <div className="hidden lg:block sticky top-8 self-start">
          <HeroPreview hero={form} />
        </div>
      </div>
    </form>
  );
}
