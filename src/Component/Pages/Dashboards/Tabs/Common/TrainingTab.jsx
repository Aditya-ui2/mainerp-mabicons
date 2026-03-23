import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiCheckCircle, FiClock, FiPlay, FiAward } from 'react-icons/fi';
import { getMyTrainings, updateTraining } from '../../service/api';

const statusConfig = {
  'not-started': { color: '#6b7280', bg: '#f3f4f6', icon: FiClock, label: 'Not Started' },
  'in-progress': { color: '#3b82f6', bg: '#dbeafe', icon: FiPlay, label: 'In Progress' },
  completed: { color: '#10b981', bg: '#d1fae5', icon: FiCheckCircle, label: 'Completed' },
};

const TrainingTab = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchTrainings(); }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await getMyTrainings();
      setTrainings(res.data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, progress) => {
    try {
      await updateTraining(id, { status, progress });
      showToast('Training updated');
      fetchTrainings();
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  const completedCount = trainings.filter(t => t.status === 'completed').length;
  const inProgressCount = trainings.filter(t => t.status === 'in-progress').length;

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Training</h2>
        <p className="text-gray-500 text-sm mt-1">Your learning & development journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', count: trainings.length, color: '#6366f1' },
          { label: 'In Progress', count: inProgressCount, color: '#3b82f6' },
          { label: 'Completed', count: completedCount, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Training List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
        </div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-16">
          <FiBook style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">No trainings assigned yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((tr, idx) => {
            const sc = statusConfig[tr.status] || statusConfig['not-started'];
            return (
              <motion.div
                key={tr.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{tr.title}</h4>
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ color: sc.color, background: sc.bg }}
                      >
                        <sc.icon style={{ width: '10px', height: '10px' }} />
                        {sc.label}
                      </span>
                    </div>
                    {tr.description && <p className="text-sm text-gray-500 mt-1">{tr.description}</p>}
                    {tr.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold capitalize" style={{ background: '#ede9fe', color: '#6366f1' }}>
                        {tr.category}
                      </span>
                    )}
                    {tr.assignedByName && (
                      <p className="text-xs text-gray-400 mt-1">Assigned by {tr.assignedByName}</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{tr.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${tr.progress || 0}%`, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                {tr.status !== 'completed' && (
                  <div className="flex gap-2">
                    {tr.status === 'not-started' && (
                      <button
                        onClick={() => handleStatusUpdate(tr.id, 'in-progress', 10)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ background: '#3b82f6' }}
                      >
                        <FiPlay style={{ width: '12px', height: '12px' }} /> Start
                      </button>
                    )}
                    {tr.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(tr.id, 'in-progress', Math.min((tr.progress || 0) + 25, 90))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: '#dbeafe', color: '#3b82f6' }}
                        >
                          +25%
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tr.id, 'completed', 100)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                          style={{ background: '#10b981' }}
                        >
                          <FiCheckCircle style={{ width: '12px', height: '12px' }} /> Complete
                        </button>
                      </>
                    )}
                  </div>
                )}
                {tr.status === 'completed' && tr.certificateUrl && (
                  <a
                    href={tr.certificateUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: '#f59e0b' }}
                  >
                    <FiAward style={{ width: '14px', height: '14px' }} /> View Certificate
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainingTab;
