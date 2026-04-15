import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  FiRefreshCw,
  FiPlus,
  FiX,
  FiSearch,
  FiUsers,
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiCheck,
  FiXCircle,
  FiTrash2,
  FiClock,
  FiAlertCircle,
  FiChevronDown,
  FiEdit,
  FiBookOpen,
  FiRepeat,
  FiBriefcase,
  FiInfo,
  FiCheckCircle,
  FiPackage,
  FiFileText,
  FiFilter
} from 'react-icons/fi';
import {
  createWorkHandover,
  getWorkHandovers,
  changeHandoverStatus,
  deleteWorkHandover,
  getAdminHierarchy,
  getClientsForTeamLeader,
} from '../../../service/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
  Active: { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500', label: 'In Progress' },
  Completed: { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', label: 'Finalized' },
  Cancelled: { bg: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500', label: 'Revoked' },
};

/**
 * Standardized Work Handover Hub
 * Design Language: Minimalist Professional (Outfit, Slate, High-Radius)
 */
export default function WorkHandoverTab({ isDarkMode = false }) {
  const [handovers, setHandovers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [fromUserClients, setFromUserClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedHandoverId, setSelectedHandoverId] = useState(null);

  const [form, setForm] = useState({
    fromUserId: '',
    toUserId: '',
    reason: '',
    startDate: '',
    endDate: '',
    clientIds: [],
    notes: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      let decoded = null;
      try {
        decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (e) { console.error('JWT Decode failed'); }

      const handoverRes = await getWorkHandovers();
      const rawHandovers = Array.isArray(handoverRes?.data) ? handoverRes.data : [];
      setHandovers(rawHandovers);

      if (rawHandovers.length > 0 && !selectedHandoverId) {
        setSelectedHandoverId(rawHandovers[0]._id);
      }

      if (decoded) {
        try {
          const hierarchy = await getAdminHierarchy(decoded.id, decoded.role === 'Admin' ? 'Admin' : 'TeamLeader');
          const fetchedTLs = hierarchy?.adminHierarchy?.teamLeaders || [];
          
          // Adding requested names (Manju, Jyoti, Priyanshi) to the options
          const manualTLs = [
            { id: 'manju-mock', name: 'Manju' },
            { id: 'jyoti-mock', name: 'Jyoti' },
            { id: 'priyanshi-mock', name: 'Priyanshi' }
          ];
          
          // Combine fetched and manual TLs, ensuring no duplicates by name
          const combined = [...fetchedTLs];
          manualTLs.forEach(m => {
            if (!combined.some(c => c.name.toLowerCase() === m.name.toLowerCase())) {
              combined.push(m);
            }
          });
          
          setTeamLeaders(combined);
        } catch {
          setTeamLeaders([
            { id: decoded.id, name: decoded.name || 'Me', email: '' },
            { id: 'manju-mock', name: 'Manju' },
            { id: 'jyoti-mock', name: 'Jyoti' },
            { id: 'priyanshi-mock', name: 'Priyanshi' }
          ]);
        }
      }
    } catch (e) {
      console.error('WorkHandoverTab error:', e);
      toast.error('Sync Failure');
    } finally {
      setLoading(false);
    }
  }, [selectedHandoverId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (form.fromUserId) {
      setLoadingClients(true);
      getClientsForTeamLeader(form.fromUserId)
        .then(res => setFromUserClients(res?.data || []))
        .catch(() => setFromUserClients([]))
        .finally(() => setLoadingClients(false));
    } else {
      setFromUserClients([]);
    }
  }, [form.fromUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.toUserId || !form.fromUserId || !form.reason) {
        return toast.error('Complete required fields');
      }
      const res = await createWorkHandover(form);
      if (res?.success) {
        toast.success('Delegation Active');
        setShowModal(false);
        setForm({ fromUserId: '', toUserId: '', reason: '', startDate: '', endDate: '', clientIds: [], notes: '' });
        fetchAll();
      }
    } catch (e) {
      toast.error(e.message || 'Transmission Error');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await changeHandoverStatus(id, status);
      if (res?.success) {
        toast.success(`Asset marked as ${status}`);
        fetchAll();
      }
    } catch (e) { toast.error('Status update failed'); }
  };

  const removeHandover = async (id) => {
    if (!window.confirm('Revoke this delegation permanently?')) return;
    try {
      const res = await deleteWorkHandover(id);
      if (res?.success) {
        toast.success('Asset purged');
        fetchAll();
      }
    } catch (e) { toast.error('Purge failed'); }
  };

  const filteredHandovers = useMemo(() =>
    (handovers || []).filter(h => {
      const q = search.toLowerCase();
      return (h.fromUser?.name || '').toLowerCase().includes(q) ||
        (h.toUser?.name || '').toLowerCase().includes(q) ||
        (h.reason || '').toLowerCase().includes(q);
    }), [handovers, search]);

  const selectedHandover = handovers.find(h => h._id === selectedHandoverId);

  if (loading && handovers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] w-full h-[400px]">
        <div className="w-10 h-10 border-4 border-[#3056D3] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Archive...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden font-['Outfit'] text-slate-900 text-left">
      
      {/* STANDARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] tracking-tight leading-none mb-1">Work Handover</h1>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-semibold hover:bg-[#0a3a82] transition-all shadow-md hover:shadow-lg"
          >
            <FiPlus size={16} /> New Delegation
          </button>
        </div>
      </div>

      {/* FILTER BAR - Modern Job Openings Style */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative flex-1 group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#0D47A1]" size={18} />
          <input
            type="text"
            placeholder="Search handovers, users or reasons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* LEFT PANEL: Handover List */}
        <div className="w-[340px] flex flex-col gap-3 overflow-y-auto no-scrollbar pb-10">
          {filteredHandovers.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-10 text-center opacity-40">
              <FiBriefcase className="mx-auto mb-4 text-slate-300" size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empty Ledger</p>
            </div>
          ) : (
            filteredHandovers.map(h => (
              <div
                key={h._id}
                onClick={() => setSelectedHandoverId(h._id)}
                className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-200 border ${
                  selectedHandoverId === h._id
                    ? 'bg-white border-[#3056D3] shadow-xl shadow-[#3056D3]/5 ring-1 ring-[#3056D3]/5'
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider ${statusColors[h.status || 'Active'].bg}`}>
                    {statusColors[h.status || 'Active'].label}
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 tracking-tight flex items-center gap-1">
                    <FiCalendar size={10} /> {new Date(h.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedHandoverId === h._id ? 'text-[#3056D3]' : 'text-slate-900'}`}>
                      {h.fromUser?.name || 'User'}
                    </h4>
                    <FiArrowRight size={10} className="my-1 text-slate-300" />
                    <h4 className="text-sm font-medium text-slate-600 truncate">{h.toUser?.name || 'Recipient'}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                    <FiBriefcase size={10} /> {h.clientIds?.length || 0} Assets
                  </span>
                  <div className={`w-2 h-2 rounded-full ${statusColors[h.status || 'Active'].dot} shadow-sm`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL: Detail View */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
          {selectedHandover ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 bg-[#fafbfc] flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center -space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#3056D3] text-xl font-bold shadow-sm ring-4 ring-white">
                      {(selectedHandover.fromUser?.name || 'U')[0]}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 text-xl font-bold shadow-sm ring-4 ring-[#fafbfc]">
                      {(selectedHandover.toUser?.name || 'R')[0]}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Task Delegation Cycle</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                      {selectedHandover.fromUser?.name} <span className="mx-2 text-slate-200">/</span> {selectedHandover.toUser?.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateStatus(selectedHandover._id, 'Completed')}
                    className="p-3.5 bg-white text-emerald-500 rounded-2xl hover:bg-emerald-50 transition-all border border-slate-100 shadow-sm"
                    title="Finalize Handover"
                  >
                    <FiCheckCircle size={18} />
                  </button>
                  <button 
                    onClick={() => removeHandover(selectedHandover._id)}
                    className="p-3.5 bg-white text-rose-500 rounded-2xl hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                    title="Revoke Delegation"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto no-scrollbar bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Info Cards */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FiInfo size={12} className="text-[#3056D3]" /> Context & Logic
                      </h3>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                        "{selectedHandover.reason}"
                      </p>
                      {selectedHandover.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-[11px] text-slate-500 line-clamp-3">{selectedHandover.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FiClock size={12} className="text-[#3056D3]" /> Temporal Scope
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Effective From</p>
                          <p className="text-sm font-bold text-slate-800">{new Date(selectedHandover.startDate).toLocaleDateString()}</p>
                        </div>
                        <FiArrowRight className="text-slate-200" />
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Target End</p>
                          <p className="text-sm font-bold text-slate-800">{selectedHandover.endDate ? new Date(selectedHandover.endDate).toLocaleDateString() : 'Continuous'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Asset Map */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                      <FiPackage size={12} className="text-[#3056D3]" /> Assigned Portfolio
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedHandover.clientIds?.length > 0 ? (
                        selectedHandover.clientIds.map((client, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-[#3056D3] group-hover:text-white transition-all">
                                {idx + 1}
                              </div>
                              <span className="text-xs font-bold text-slate-700">{client.name || 'Client Asset'}</span>
                            </div>
                            <FiCheck className="text-emerald-400" size={14} />
                          </div>
                        ))
                      ) : (
                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center opacity-40">
                          <p className="text-[9px] font-bold uppercase tracking-widest">No Clients Mapped</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-30 text-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 animate-[spin_30s_linear_infinite] mb-8" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[6px]">Selection Pending from Archive</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE HANDOVER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-all duration-300">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500"
            >
              {/* Header */}
              <div className="px-10 py-8 bg-gradient-to-r from-white to-[#F8FAFF] border-b border-[#F4F3EF] flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Active Duty Delegation</h2>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">Initialize Work Migration Sequence</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                <div className="grid grid-cols-2 gap-x-8 gap-y-7 mb-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Source User</label>
                    <select
                      value={form.fromUserId}
                      onChange={(e) => setForm({ ...form, fromUserId: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 appearance-none cursor-pointer"
                    >
                      <option value="">Select Primary</option>
                      {teamLeaders.map(tl => <option key={tl.id} value={tl.id}>{tl.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Target Recipient</label>
                    <select
                      value={form.toUserId}
                      onChange={(e) => setForm({ ...form, toUserId: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 appearance-none cursor-pointer"
                    >
                      <option value="">Select Destination</option>
                      {teamLeaders.map(tl => <option key={tl.id} value={tl.id}>{tl.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-7 mb-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Lifecycle Start</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 cursor-pointer text-left"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Lifecycle End</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 cursor-pointer text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mb-8">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Migration Logic (Reason)</label>
                    <textarea
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      placeholder="Brief context for migration..."
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 min-h-[100px] resize-none placeholder:text-[#9B9BAD]/50"
                    />
                </div>

                {fromUserClients.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Asset Map Selection</label>
                    <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto no-scrollbar p-1">
                      {fromUserClients.map(client => (
                        <div
                          key={client.id}
                          onClick={() => {
                            const current = form.clientIds;
                            const newVal = current.includes(client.id) ? current.filter(id => id !== client.id) : [...current, client.id];
                            setForm({ ...form, clientIds: newVal });
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.02] active:scale-95 ${
                            form.clientIds.includes(client.id) ? 'bg-[#0D47A1] border-[#0D47A1] text-white' : 'bg-white border-[#F4F3EF] text-[#6B6B7E] hover:border-[#0D47A1]/20'
                          }`}
                        >
                          <span className="text-[11px] font-bold truncate pr-4 uppercase tracking-tighter">{client.name}</span>
                          {form.clientIds.includes(client.id) && <FiCheck size={12} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-5 bg-[#0D47A1] text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  Confirm Asset Migration <FiArrowRight />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
