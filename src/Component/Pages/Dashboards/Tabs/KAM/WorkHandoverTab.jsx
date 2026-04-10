import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiEdit,
  FiClock,
  FiAlertCircle,
  FiChevronDown,
} from 'react-icons/fi';
import {
  createWorkHandover,
  getWorkHandovers,
  changeHandoverStatus,
  deleteWorkHandover,
  getAllClients,
  getAdminHierarchy,
  getClientsForTeamLeader,
} from '../../../service/api';

const statusColors = {
  Active: { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  Completed: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  Cancelled: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function WorkHandoverTab({ isDarkMode }) {
  const [handovers, setHandovers] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fromUserClients, setFromUserClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [form, setForm] = useState({
    fromUserId: '',
    toUserId: '',
    reason: '',
    startDate: '',
    endDate: '',
    clientIds: [],
    notes: '',
  });

  /* ── palette ── */
  const bg = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-white';
  const bgSub = isDarkMode ? 'bg-[#282440]' : 'bg-[#f7f5fc]';
  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';

  /* ── load data ── */
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      setCurrentUser(decoded);

      const [handoverRes, clientsRes] = await Promise.all([
        getWorkHandovers(),
        getAllClients(),
      ]);

      setHandovers(handoverRes?.data || []);
      const clientList = Array.isArray(clientsRes) ? clientsRes : clientsRes?.data?.clients ?? clientsRes?.clients ?? [];
      setClients(clientList);

      // Try loading team leaders from admin hierarchy
      try {
        const hierarchy = await getAdminHierarchy(decoded.id, decoded.role === 'Admin' ? 'Admin' : 'TeamLeader');
        if (decoded.role === 'Admin') {
          const tls = hierarchy?.adminHierarchy?.teamLeaders || [];
          setTeamLeaders(tls);
        } else {
          // If current user is a TL, they might not have access to admin hierarchy
          // We'll use the handover data to build a team leader list
          const allTlIds = new Set();
          (handoverRes?.data || []).forEach(h => {
            if (h.fromUser) allTlIds.add(JSON.stringify(h.fromUser));
            if (h.toUser) allTlIds.add(JSON.stringify(h.toUser));
          });
          const uniqueTls = [...allTlIds].map(s => JSON.parse(s));
          // Also add self
          uniqueTls.push({ id: decoded.id, name: decoded.name || 'Me', email: decoded.email || '' });
          setTeamLeaders(uniqueTls);
        }
      } catch {
        // Fallback: at least add self
        setTeamLeaders([{ id: decoded.id, name: decoded.name || 'Me', email: '' }]);
      }
    } catch (e) {
      console.error('Failed to load handover data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── handlers ── */
  const handleCreate = async () => {
    if (!form.fromUserId || !form.toUserId || !form.reason || !form.startDate || !form.endDate || !form.clientIds.length) return;
    try {
      await createWorkHandover(form);
      setShowModal(false);
      setForm({ fromUserId: '', toUserId: '', reason: '', startDate: '', endDate: '', clientIds: [], notes: '' });
      fetchAll();
    } catch (e) {
      console.error('Create handover error', e);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await changeHandoverStatus(id, status);
      fetchAll();
    } catch (e) {
      console.error('Status change error', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkHandover(id);
      setConfirmDelete(null);
      fetchAll();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const toggleClientSelection = (clientId) => {
    setForm(f => ({
      ...f,
      clientIds: f.clientIds.includes(clientId)
        ? f.clientIds.filter(id => id !== clientId)
        : [...f.clientIds, clientId]
    }));
  };

  const isRecruitmentHeadUser = (user) => {
    if (!user) return false;
    const email = String(user.email || '').toLowerCase();
    const name = String(user.name || '').toLowerCase();
    return email.includes('sachin') || name.includes('sachin') || String(user.role || '').toLowerCase().includes('recruitmenthead');
  };

  const findHeadAssigneeId = () => {
    const headFromTeamLeaders = teamLeaders.find(tl => {
      const email = String(tl.email || '').toLowerCase();
      const name = String(tl.name || '').toLowerCase();
      return email.includes('sachin') || name.includes('sachin');
    });
    if (headFromTeamLeaders) return headFromTeamLeaders.id;
    if (isRecruitmentHeadUser(currentUser)) return currentUser.id;
    return '';
  };

  useEffect(() => {
    const loadFromUserClients = async () => {
      if (!form.fromUserId) {
        setFromUserClients([]);
        return;
      }
      setLoadingClients(true);
      try {
        const response = await getClientsForTeamLeader({ teamLeaderId: form.fromUserId });
        const clientsForFromUser = Array.isArray(response.clients) ? response.clients : response.data?.clients || [];
        setFromUserClients(clientsForFromUser);
        setForm(f => {
          const newForm = {
            ...f,
            clientIds: clientsForFromUser.map(c => c.id)
          };
          const headId = findHeadAssigneeId();
          if (!newForm.toUserId && headId) {
            newForm.toUserId = headId;
          }
          return newForm;
        });
      } catch (error) {
        console.warn('Could not load clients for selected KAM:', error?.message || error);
        setFromUserClients([]);
        setForm(f => ({ ...f, clientIds: [] }));
      } finally {
        setLoadingClients(false);
      }
    };

    loadFromUserClients();
  }, [form.fromUserId, currentUser, teamLeaders]);

  /* ── filtered list ── */
  const filtered = handovers.filter(h => {
    if (filterStatus !== 'All' && h.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (h.fromUser?.name || '').toLowerCase().includes(q) ||
        (h.toUser?.name || '').toLowerCase().includes(q);
      const matchReason = (h.reason || '').toLowerCase().includes(q);
      const matchClient = (h.clients || []).some(c => (c.name || c.companyName || '').toLowerCase().includes(q));
      return matchName || matchReason || matchClient;
    }
    return true;
  });

  /* ── summary ── */
  const summary = {
    total: handovers.length,
    active: handovers.filter(h => h.status === 'Active').length,
    completed: handovers.filter(h => h.status === 'Completed').length,
    cancelled: handovers.filter(h => h.status === 'Cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
            <FiRefreshCw size={22} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${text}`}>Work Handover</h2>
            <p className={`text-sm ${textSub}`}>Manage absences & delegate client work to other KAMs</p>
          </div>
        </div>
        <button
          onClick={() => {
            setForm(f => ({ ...f, fromUserId: currentUser?.id || '' }));
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow hover:shadow-md transition-all"
        >
          <FiPlus size={16} /> New Handover
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: summary.total, icon: FiUsers, color: 'violet' },
          { label: 'Active', value: summary.active, icon: FiClock, color: 'green' },
          { label: 'Completed', value: summary.completed, icon: FiCheck, color: 'blue' },
          { label: 'Cancelled', value: summary.cancelled, icon: FiXCircle, color: 'red' },
        ].map(c => (
          <div key={c.label} className={`${cardBg} rounded-xl ${border} border p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-lg bg-${c.color}-100 ${isDarkMode ? `bg-${c.color}-900/30` : ''}`}>
              <c.icon size={18} className={`text-${c.color}-500`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{c.value}</p>
              <p className={`text-xs ${textSub}`}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg} flex-1`}>
          <FiSearch className={textSub} size={16} />
          <input
            type="text" placeholder="Search handovers…"
            value={search} onChange={e => setSearch(e.target.value)}
            className={`bg-transparent outline-none text-sm w-full ${text}`}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${filterStatus === s
                ? 'bg-violet-500 text-white'
                : `${bgSub} ${text} ${border} border`
                }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Handover list */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${textSub}`}>
          <FiAlertCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No handovers found</p>
          <p className="text-sm mt-1">Create one to delegate client work during absence</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(h => (
              <motion.div key={h.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`${cardBg} ${border} border rounded-2xl p-5 flex flex-col gap-3`}
              >
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* From user */}
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">
                        {(h.fromUser?.name || '?')[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${text}`}>{h.fromUser?.name || 'Unknown'}</p>
                        <p className={`text-[10px] ${textSub}`}>Absent</p>
                      </div>
                    </div>
                    <FiArrowRight className={textSub} />
                    {/* To user */}
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                        {(h.toUser?.name || '?')[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${text}`}>{h.toUser?.name || 'Unknown'}</p>
                        <p className={`text-[10px] ${textSub}`}>Covering</p>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[h.status]?.bg || 'bg-gray-100 text-gray-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColors[h.status]?.dot || 'bg-gray-400'}`} />
                    {h.status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className={`text-xs ${textSub}`}>Reason</p>
                    <p className={`font-medium ${text}`}>{h.reason}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSub}`}>Period</p>
                    <p className={`font-medium ${text}`}>
                      {new Date(h.startDate).toLocaleDateString()} — {new Date(h.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSub}`}>Clients ({(h.clients || []).length})</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(h.clients || []).slice(0, 3).map(c => (
                        <span key={c.id} className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${bgSub} ${text}`}>
                          {c.companyName || c.name}
                        </span>
                      ))}
                      {(h.clients || []).length > 3 && (
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${textSub}`}>
                          +{(h.clients || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {h.notes && (
                  <p className={`text-xs ${textSub} italic`}>Notes: {h.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-dashed" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
                  {h.status === 'Active' && (
                    <>
                      <button onClick={() => handleStatusChange(h.id, 'Completed')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition">
                        <FiCheck size={12} /> Complete
                      </button>
                      <button onClick={() => handleStatusChange(h.id, 'Cancelled')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition">
                        <FiXCircle size={12} /> Cancel
                      </button>
                    </>
                  )}
                  <button onClick={() => setConfirmDelete(h.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition ml-auto">
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ Create Modal ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`${bg} rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
              <h3 className={`text-lg font-bold ${text}`}>New Work Handover</h3>
              <button onClick={() => setShowModal(false)}><FiX size={20} className={textSub} /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* From KAM */}
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Absent KAM</label>
                <select value={form.fromUserId} onChange={e => setForm(f => ({ ...f, fromUserId: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`}>
                  <option value="">Select KAM…</option>
                  {teamLeaders.map(tl => (
                    <option key={tl.id} value={tl.id}>{tl.name} ({tl.email})</option>
                  ))}
                </select>
              </div>

              {/* To KAM */}
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Covering KAM</label>
                <select value={form.toUserId} onChange={e => setForm(f => ({ ...f, toUserId: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`}>
                  <option value="">Select KAM…</option>
                  {teamLeaders.filter(tl => tl.id !== form.fromUserId).map(tl => (
                    <option key={tl.id} value={tl.id}>{tl.name} ({tl.email})</option>
                  ))}
                </select>
                <p className={`text-xs mt-1 ${textSub}`}>
                  If no covering KAM is selected, this will default to Sachin (Recruitment Head) when available.
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Reason for Absence</label>
                <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`}>
                  <option value="">Select reason…</option>
                  {['Sick Leave', 'Vacation', 'Personal Leave', 'Training', 'Maternity/Paternity Leave', 'Other'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSub} mb-1 block`}>End Date</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`} />
                </div>
              </div>

              {/* Client selection */}
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>
                  Clients to Hand Over ({form.clientIds.length} selected)
                </label>
                {form.fromUserId && (
                  <p className={`text-xs ${textSub} mb-2`}>Auto-selected all current clients for the absent KAM.</p>
                )}
                <div className={`max-h-40 overflow-y-auto rounded-xl ${border} border p-2 space-y-1`}>
                  {loadingClients ? (
                    <p className={`text-sm ${textSub} text-center py-2`}>Loading clients for selected KAM…</p>
                  ) : fromUserClients.length === 0 ? (
                    <p className={`text-sm ${textSub} text-center py-2`}>No clients found for the selected absent KAM.</p>
                  ) : (
                    fromUserClients.map(c => (
                      <button key={c.id} type="button"
                        onClick={() => toggleClientSelection(c.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${form.clientIds.includes(c.id)
                          ? isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-700'
                          : `${bgSub} ${text}`
                          }`}>
                        <span className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${form.clientIds.includes(c.id)
                          ? 'bg-violet-500 border-violet-500 text-white' : `${border} border`
                          }`}>
                          {form.clientIds.includes(c.id) && '✓'}
                        </span>
                        <span className="truncate">{c.clientName || c.name} {c.companyName ? `(${c.companyName})` : ''}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any special instructions for the covering KAM…"
                  rows={2}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border resize-none`} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
              <button onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${bgSub} ${text} ${border} border`}>
                Cancel
              </button>
              <button onClick={handleCreate}
                disabled={!form.fromUserId || !form.toUserId || !form.reason || !form.startDate || !form.endDate || !form.clientIds.length}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow disabled:opacity-40 disabled:cursor-not-allowed">
                Create Handover
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ Delete Confirm ═══ */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`${bg} rounded-2xl shadow-xl p-6 w-full max-w-sm`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100 text-red-500"><FiTrash2 size={20} /></div>
              <h3 className={`text-lg font-bold ${text}`}>Delete Handover?</h3>
            </div>
            <p className={`text-sm ${textSub} mb-5`}>This action cannot be undone. The handover record will be permanently removed.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${bgSub} ${text}`}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white shadow">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
