import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function ManageHero() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagline, setNewTagline] = useState("");
  const [form, setForm] = useState({
    name: "",
    bio: "",
    tagline: [],
    profileImageUrl: "",
    resumeUrl: "",
    availableForWork: true,
  });

  const { data: hero, isLoading } = useQuery({
    queryKey: ["hero"],
    queryFn: () => api.get("/hero").then(res => res.data),
  });

  // Pre-fill form when hero data loads
  useEffect(() => {
    if (hero) {
      setForm({
        name: hero.name || "",
        bio: hero.bio || "",
        tagline: hero.tagline || [],
        profileImageUrl: hero.profileImageUrl || "",
        resumeUrl: hero.resumeUrl || "",
        availableForWork: hero.availableForWork ?? true,
      });
    }
  }, [hero]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add a new tagline string to the array
  const handleAddTagline = () => {
    if (!newTagline.trim()) return;
    setForm(prev => ({
      ...prev,
      tagline: [...prev.tagline, newTagline.trim()],
    }));
    setNewTagline("");
  };

  // Remove a tagline by its index
  const handleRemoveTagline = index => {
    setForm(prev => ({
      ...prev,
      tagline: prev.tagline.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch("/admin/hero", form);
      toast.success("Hero section updated");

      // Invalidate both admin and public hero cache
      queryClient.invalidateQueries({ queryKey: ["hero"] });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `
    w-full px-3 h-10 rounded-lg text-[11px] font-mono tracking-wide
    bg-background border border-border
    text-foreground placeholder:text-muted-foreground/40
    focus:outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10
    transition-all duration-150
  `;

  if (isLoading)
    return (
      <div className="flex justify-center py-24 select-none">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="w-full selection:bg-primary/10 selection:text-primary">
      {/* Page header */}
      <div className="mb-6 select-none">
        <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground mb-1">
          Hero Parameters
        </h1>
        <p className="text-[11px] font-mono text-muted-foreground">
          Mutate operational branding context identity configuration properties
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          {/* Basic info card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm"
          >
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 border-b border-border/50 pb-2">
              Identity Metadata
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Core Operator Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Executive Brief Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="A short description about yourself"
                  rows={4}
                  className={`${inputClass} h-auto py-2.5 resize-none leading-relaxed font-sans text-xs`}
                />
              </div>
            </div>
          </motion.div>

          {/* Taglines card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm"
          >
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">
              Dynamic Stream Arrays
            </h2>
            <p className="text-[10px] font-mono text-muted-foreground/70 mb-4 pb-2 border-b border-border/50">
              Iterative character compilation arrays parsed via terminal effect pipelines
            </p>

            {/* Existing taglines */}
            <div className="flex flex-col gap-1.5 mb-4">
              {form.tagline.length === 0 && (
                <p className="text-[10px] font-mono text-muted-foreground/50 italic px-1 py-1">
                  No vectors stored inside layout array stack
                </p>
              )}
              {form.tagline.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 h-9 rounded-lg bg-muted/40 border border-border/60 group"
                >
                  <span className="text-[11px] font-mono text-foreground tracking-wide truncate pr-4">
                    {tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTagline(index)}
                    className="p-1 -mr-1 text-muted-foreground/40 hover:text-destructive transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new tagline */}
            <div className="flex gap-2">
              <input
                value={newTagline}
                onChange={e => setNewTagline(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTagline();
                  }
                }}
                placeholder="e.g. Full-Stack Developer"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddTagline}
                className="flex items-center gap-1.5 px-3.5 h-10 bg-muted border border-border hover:bg-muted/80 text-foreground text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus size={12} />
                Append
              </button>
            </div>
          </motion.div>

          {/* Links card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm"
          >
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 border-b border-border/50 pb-2">
              Resource Network Targets
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Static Avatar Frame URI
                </label>
                <input
                  name="profileImageUrl"
                  value={form.profileImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className={inputClass}
                />
                {/* Live preview */}
                {form.profileImageUrl && (
                  <div className="flex items-center gap-2.5 mt-2 px-1 select-none">
                    <img
                      src={form.profileImageUrl}
                      alt="Preview"
                      className="w-8 h-8 rounded-lg object-cover border border-border bg-muted/50"
                      onError={e => (e.target.style.display = "none")}
                    />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60">
                      Asset Frame Stream Match
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-0.5">
                  Secure File Manifest URI (Resume)
                </label>
                <input
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/resume.pdf"
                  className={inputClass}
                />
              </div>
            </div>
          </motion.div>

          {/* Availability card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-card border border-border rounded-xl p-5 subpixel-antialiased shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 select-none">
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-0.5">
                  Pipeline Telemetry Broadcast
                </h2>
                <p className="text-[10px] font-mono text-muted-foreground/70">
                  Global system availability pulsing telemetry visual notification target nodes
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    availableForWork: !prev.availableForWork,
                  }))
                }
                className={`relative w-9 h-5 rounded-full transition-colors duration-150 shrink-0 cursor-pointer border border-transparent
                  ${form.availableForWork ? "bg-primary" : "bg-muted border-border"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-150
                  ${form.availableForWork ? "translate-x-4 bg-primary-foreground" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Status indicator */}
            {form.availableForWork && (
              <div className="flex items-center gap-2 mt-4 px-3 h-8 rounded-lg bg-foreground/[0.02] border border-border/80 select-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                  Active connection beacon running on core cluster layout
                </span>
              </div>
            )}
          </motion.div>

          {/* Save button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="flex justify-end pt-1"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 h-10 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors border border-transparent hover:bg-primary/90 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  <span>Syncing Pipeline...</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>Commit Transmit</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
