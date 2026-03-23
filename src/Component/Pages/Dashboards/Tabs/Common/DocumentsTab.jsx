import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiUpload, FiTrash2, FiFile, FiDownload, FiX, FiSearch } from 'react-icons/fi';
import { getDeptDocuments, uploadDeptDocument, deleteDeptDocument } from '../../../service/api';

const categoryColors = {
  policy: '#6366f1', template: '#10b981', guide: '#3b82f6', form: '#f59e0b', other: '#6b7280',
};

const DocumentsTab = ({ department, isHead = false }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', fileUrl: '', category: 'other' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchDocs(); }, [department]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await getDeptDocuments(department);
      setDocs(res.data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.name || !form.fileUrl) {
      showToast('Name and file URL are required', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await uploadDeptDocument({ ...form, department });
      showToast('Document uploaded');
      setShowForm(false);
      setForm({ name: '', description: '', fileUrl: '', category: 'other' });
      fetchDocs();
    } catch (err) {
      showToast(err.message || 'Failed to upload', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeptDocument(id);
      showToast('Document deleted');
      fetchDocs();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filteredDocs = docs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium"
            style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-500 text-sm mt-1">Department documents & resources</p>
        </div>
        {isHead && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <FiUpload style={{ width: '18px', height: '18px' }} />
            Upload Document
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch style={{ width: '18px', height: '18px', color: '#9ca3af', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          placeholder="Search documents..."
        />
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Upload Document</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <FiX style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                  <input
                    type="text" value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                  <input
                    type="text" value={form.fileUrl}
                    onChange={(e) => setForm(p => ({ ...p, fileUrl: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="policy">Policy</option>
                    <option value="template">Template</option>
                    <option value="guide">Guide</option>
                    <option value="form">Form</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-white font-medium"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {submitting ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docs Grid */}
      {loading ? (
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16">
          <FiFolder style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">{search ? 'No matching documents' : 'No documents yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDocs.map((doc, idx) => {
            const catColor = categoryColors[doc.category] || '#6b7280';
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg" style={{ background: `${catColor}15` }}>
                    <FiFile style={{ width: '20px', height: '20px', color: catColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
                    {doc.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" style={{ color: catColor, background: `${catColor}15` }}>
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{doc.uploadedByName}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-blue-50">
                        <FiDownload style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                      </a>
                    )}
                    {isHead && (
                      <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-red-50">
                        <FiTrash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
