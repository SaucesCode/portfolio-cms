import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Check, RefreshCw, Star, GitFork,
  ExternalLink, Sparkles
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const emptyForm = {
  title: '',
  description: '',
  techStack: [],
  imageUrl: '',
  liveUrl: '',
  githubUrl: '',
  githubRepoName: '',
  featured: false,
  orderIndex: 0,
};

export default function ManageProjects() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [newTech, setNewTech] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.get('/admin/projects').then(res => res.data),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      techStack: project.techStack || [],
      imageUrl: project.imageUrl || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      githubRepoName: project.githubRepoName || '',
      featured: project.featured,
      orderIndex: project.orderIndex,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setNewTech('');
  };

  // Add tech tag to array
  const handleAddTech = () => {
    if (!newTech.trim()) return;
    setForm(prev => ({
      ...prev,
      techStack: [...prev.techStack, newTech.trim()]
    }));
    setNewTech('');
  };

  // Remove tech tag by index
  const handleRemoveTech = (index) => {
    setForm(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  // Auto-fill from GitHub — fetches repo data and pre-populates form
  const handleAutoFill = async () => {
    if (!form.githubRepoName.trim()) {
      toast.error('Enter a repo name first');
      return;
    }

    setIsAutoFilling(true);
    try {
      // We call the sync endpoint for a single project
      // by temporarily creating it and syncing
      // Instead let's call GitHub service directly via a dedicated endpoint
      const res = await api.get(
        `/admin/github/repo/${form.githubRepoName}`
      );

      const { title, description, language, stars, forks, githubUrl } = res.data;

      setForm(prev => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        githubUrl: githubUrl || prev.githubUrl,
        // Add language to tech stack if not already there
        techStack: language && !prev.techStack.includes(language)
          ? [...prev.techStack, language]
          : prev.techStack,
      }));

      toast.success('Fields pre-filled from GitHub!');

    } catch (error) {
      toast.error('Could not fetch repo — check the repo name');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex),
      };

      if (editingId) {
        await api.patch(`/admin/projects/${editingId}`, payload);
        toast.success('Project updated');
      } else {
        await api.post('/admin/projects', payload);
        toast.success('Project added');
      }

      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleCancel();

    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Sync a single project's GitHub data
  const handleSyncOne = async (project) => {
    if (!project.githubRepoName) {
      toast.error('No GitHub repo linked to this project');
      return;
    }

    setSyncingId(project.id);
    try {
      await api.post('/admin/github/sync');
      toast.success('GitHub data synced');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  const inputClass = `
    w-full px-3 py-2 rounded-lg text-sm
    bg-gray-800 border border-white/10
    text-white placeholder:text-gray-600
    focus:outline-none focus:border-blue-500/50
    transition-all duration-200
  `;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
          <p className="text-gray-500 text-sm">{projects.length} projects</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus size={16} />
            Add Project
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-sm font-semibold text-white mb-4">
              {editingId ? 'Edit Project' : 'Add Project'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* GitHub repo name + auto-fill */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">
                  GitHub Repo Name
                  <span className="text-gray-600 ml-1">(optional — used for auto-fill and sync)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    name="githubRepoName"
                    value={form.githubRepoName}
                    onChange={handleChange}
                    placeholder="e.g. QuickAid-Geomapping"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isAutoFilling}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 hover:border-blue-500/30 text-gray-300 hover:text-white text-sm rounded-lg transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <Sparkles size={14} className={isAutoFilling ? 'animate-pulse' : ''} />
                    {isAutoFilling ? 'Filling...' : 'Auto-fill'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Project title"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Order</label>
                  <input
                    type="number"
                    name="orderIndex"
                    value={form.orderIndex}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Live URL</label>
                  <input
                    name="liveUrl"
                    value={form.liveUrl}
                    onChange={handleChange}
                    placeholder="https://yourproject.com"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">GitHub URL</label>
                  <input
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Image URL</label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    Featured project
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What does this project do?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Tech stack tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Tech Stack</label>

                {/* Existing tags */}
                {form.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(index)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add tech */}
                <div className="flex gap-2">
                  <input
                    value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="e.g. React"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all whitespace-nowrap"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                >
                  <Check size={15} />
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add Project'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm rounded-lg transition-all"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          No projects yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-blue-500/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">

                  {/* Title + featured badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                    {project.description}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.techStack.slice(0, 5).map(tech => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* GitHub stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    {project.stars !== null && (
                      <span className="flex items-center gap-1">
                        <Star size={11} />
                        {project.stars}
                      </span>
                    )}
                    {project.forks !== null && (
                      <span className="flex items-center gap-1">
                        <GitFork size={11} />
                        {project.forks}
                      </span>
                    )}
                    {project.language && (
                      <span>{project.language}</span>
                    )}
                    {project.githubSyncedAt && (
                      <span className="text-gray-700">
                        synced {new Date(project.githubSyncedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {/* Links */}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <FaGithub size={14} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {/* Sync button */}
                  {project.githubRepoName && (
                    <button
                      onClick={() => handleSyncOne(project)}
                      disabled={syncingId === project.id}
                      className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all disabled:opacity-50"
                      title="Sync GitHub data"
                    >
                      <RefreshCw
                        size={14}
                        className={syncingId === project.id ? 'animate-spin' : ''}
                      />
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}