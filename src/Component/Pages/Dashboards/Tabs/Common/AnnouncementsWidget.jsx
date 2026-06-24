import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiInfo, FiAlertCircle, FiAlertTriangle, FiBookmark, FiX, FiClock, FiChevronRight } from 'react-icons/fi';
import { getAnnouncements } from '../../../service/api';

const priorityConfig = {
  low: { color: '#10b981', bg: '#f0fdf4', label: 'Low' },
  medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
  high: { color: '#ef4444', bg: '#fef2f2', label: 'High' },
  urgent: { color: '#dc2626', bg: '#fff1f2', label: 'Urgent' },
};

const AnnouncementsWidget = ({ department = 'All' }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await getAnnouncements(department);
        if (res?.success && res?.announcements) {
          // Keep top 3 announcements for widget view
          setAnnouncements(res.announcements.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch announcements widget data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [department]);

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 animate-pulse space-y-4 h-full min-h-[300px]">
        <div className="h-6 w-1/3 bg-slate-100 rounded-lg" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't show anything if no announcements
  }

  return (
    <>
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col h-full min-h-[300px] text-left">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50/50 text-indigo-600 shadow-sm border border-indigo-50">
              <FiBell size={20} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              Announcements
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
            {announcements.length} New
          </span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {announcements.map((ann) => {
            const priority = (ann.priority || 'medium').toLowerCase();
            const pc = priorityConfig[priority] || priorityConfig.medium;
            return (
              <motion.div
                key={ann.id || ann._id}
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={() => setSelectedAnn(ann)}
                className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-100 transition-all cursor-pointer flex gap-3 items-start relative overflow-hidden"
              >
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.pinned && <FiBookmark className="text-indigo-500 flex-shrink-0" size={12} />}
                    <h4 className="text-sm font-bold text-slate-800 truncate">{ann.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <FiClock size={10} />
                    <span>{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    <span>•</span>
                    <span>{ann.postedByName}</span>
                  </div>
                </div>
                <FiChevronRight className="text-slate-300 self-center" size={16} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal / Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedAnn && (
            <div className="fixed inset-0 z-[200000] flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1]"
                onClick={() => setSelectedAnn(null)}
              />
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative bg-white w-full sm:w-[450px] shadow-2xl z-[200001] border-l border-slate-100 text-left h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                      style={{
                        color: (priorityConfig[(selectedAnn.priority || 'medium').toLowerCase()] || priorityConfig.medium).color,
                        backgroundColor: (priorityConfig[(selectedAnn.priority || 'medium').toLowerCase()] || priorityConfig.medium).bg
                      }}
                    >
                      {(selectedAnn.priority || 'Medium').toUpperCase()} PRIORITY
                    </span>
                    {selectedAnn.pinned && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold flex items-center gap-1">
                        <FiBookmark size={10} /> Pinned
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedAnn(null)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">{selectedAnn.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
                  {selectedAnn.content}
                </p>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-slate-50 bg-slate-50/30">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-inner">
                  {selectedAnn.postedByName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{selectedAnn.postedByName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(selectedAnn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(selectedAnn.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

export default AnnouncementsWidget;
