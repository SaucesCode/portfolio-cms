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
    w-full px-3 py-2 rounded-lg text-sm
    bg-gray-800 border border-white/10
    text-white placeholder:text-gray-600
    focus:outline-none focus:border-blue-500/50
    transition-all duration-200
  `;

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Hero Section</h1>
        <p className="text-gray-500 text-sm">
          Edit your name, bio, taglines and availability status
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Basic info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-4">Basic Info</h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="A short description about yourself"
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </motion.div>

          {/* Taglines card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Typewriter Taglines</h2>
            <p className="text-xs text-gray-500 mb-4">
              These cycle through the typewriter effect on your hero section
            </p>

            {/* Existing taglines */}
            <div className="flex flex-col gap-2 mb-4">
              {form.tagline.length === 0 && (
                <p className="text-xs text-gray-600">No taglines yet — add one below</p>
              )}
              {form.tagline.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 border border-white/5"
                >
                  <span className="text-sm text-gray-300 font-mono">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTagline(index)}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={13} />
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
                  // Allow pressing Enter to add tagline
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
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all whitespace-nowrap"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </motion.div>

          {/* Links card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-4">Links</h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Profile Image URL</label>
                <input
                  name="profileImageUrl"
                  value={form.profileImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className={inputClass}
                />
                {/* Live preview */}
                {form.profileImageUrl && (
                  <div className="flex items-center gap-3 mt-1">
                    <img
                      src={form.profileImageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      onError={e => (e.target.style.display = "none")}
                    />
                    <span className="text-xs text-gray-500">Preview</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Resume URL</label>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white mb-1">Available for Work</h2>
                <p className="text-xs text-gray-500">
                  Shows the pulsing green badge on your navbar and hero section
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
                className={`relative w-11 h-6 rounded-full transition-colors duration-200
                  ${form.availableForWork ? "bg-blue-600" : "bg-gray-700"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                  ${form.availableForWork ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Status indicator */}
            {form.availableForWork && (
              <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
                <span className="text-xs text-green-400">
                  Badge is currently showing on your portfolio
                </span>
              </div>
            )}
          </motion.div>

          {/* Save button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
            >
              <Check size={16} />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
