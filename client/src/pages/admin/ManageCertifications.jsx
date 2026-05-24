import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, Award, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const emptyForm = {
  name: '',
  issuer: '',
  issueDate: '',
  credentialUrl: '',
  orderIndex: 0,
};

function toInputDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric'
  });
}

export default function ManageCertifications() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['admin-certifications'],
    queryFn: () => api.get('/admin/certifications').then(res => res.data),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (cert) => {
    setEditingId(cert.id);
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: toInputDate(cert.issueDate),
      credentialUrl: cert.credentialUrl || '',
      orderIndex: cert.orderIndex,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.issuer.trim()) {
      toast.error('Name and issuer are required');
      return;
    }
    if (!form.issueDate) {
      toast.error('Issue date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        orderIndex: parseInt(form.orderIndex),
      };

      if (editingId) {
        await api.patch(`/admin/certifications/${editingId}`, payload);
        toast.success('Certification updated');
      } else {
        await api.post('/admin/certifications', payload);
        toast.success('Certification added');
      }

      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      handleCancel();

    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await api.delete(`/admin/certifications/${id}`);
      toast.success('Certification deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    } catch (error) {
      toast.error('Failed to delete');
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
          <h1 className="text-2xl font-bold text-white mb-1">Certifications</h1>
          <p className="text-gray-500 text-sm">{certifications.length} certifications</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus size={16} />
            Add Certification
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
              {editingId ? 'Edit Certification' : 'Add Certification'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Certification Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. AWS Certified Developer"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Issuer</label>
                  <input
                    name="issuer"
                    value={form.issuer}
                    onChange={handleChange}
                    placeholder="e.g. Amazon Web Services"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
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

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-gray-400">Credential URL (optional)</label>
                  <input
                    name="credentialUrl"
                    value={form.credentialUrl}
                    onChange={handleChange}
                    placeholder="https://credential.link"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                >
                  <Check size={15} />
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
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

      {/* Certifications list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          No certifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-blue-500/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                    <Award size={16} className="text-blue-400" />
                  </div>

                  <div>
                    {/* Name */}
                    <h3 className="text-sm font-semibold text-white mb-0.5">
                      {cert.name}
                    </h3>

                    {/* Issuer + date */}
                    <p className="text-xs text-gray-400 mb-2">
                      {cert.issuer} · {formatDate(cert.issueDate)}
                    </p>

                    {/* Credential link */}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink size={11} />
                        View credential
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
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