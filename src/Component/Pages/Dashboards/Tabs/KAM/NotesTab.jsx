
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiUser, FiTag, FiChevronDown, FiX, FiArrowLeft, FiCheckCircle, FiShield, FiFileText, FiClock, FiAlertCircle } from 'react-icons/fi';

const NotesTab = ({ isDarkMode, selectedClient }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState('list');
  const [editNote, setEditNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General', priority: 'Normal' });

  const categories = ['General', 'Employee', 'Client', 'HR Policy', 'Meeting', 'Reminder', 'Important'];
  const priorities = [
    { value: 'Low', label: 'Low Progress', gradient: 'from-[#3FA9F5] to-blue-400' },
    { value: 'Normal', label: 'Standard Pulse', gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { value: 'High', label: 'Critical Audit', gradient: 'from-[#FFB300] to-[#F57C00]' },
    { value: 'Urgent', label: 'Immediate Action', gradient: 'from-[#f43f5e] to-[#881337]' },
  ];

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Quarterly Review Meeting', content: 'Schedule performance reviews for Q1 2026. Ensure all managers submit their reports by March 25th.', category: 'Meeting', priority: 'High', createdBy: 'Admin', createdAt: '2026-03-15', updatedAt: '2026-03-15' },
      { id: 2, title: 'New Leave Policy Update', content: 'The new leave policy will be effective from April 1st. All employees should acknowledge the policy changes.', category: 'HR Policy', priority: 'Urgent', createdBy: 'HR Lead', createdAt: '2026-03-14', updatedAt: '2026-03-14' },
      { id: 3, title: 'Client ABC Requirements', content: 'Client ABC needs additional resources for the new project. Discuss with team lead about allocation.', category: 'Client', priority: 'Normal', createdBy: 'Project Manager', createdAt: '2026-03-12', updatedAt: '2026-03-13' },
      { id: 4, title: 'Employee Training Schedule', content: 'Technical training sessions scheduled for next week. All engineering team members should attend.', category: 'Employee', priority: 'Normal', createdBy: 'Strategy Head', createdAt: '2026-03-10', updatedAt: '2026-03-10' },
      { id: 5, title: 'Office Maintenance Protocol', content: 'AC maintenance scheduled for March 20th. Office will close early at 5 PM.', category: 'General', priority: 'Low', createdBy: 'Admin Hub', createdAt: '2026-03-08', updatedAt: '2026-03-08' },
    ];
    setTimeout(() => {
      setNotes(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getPriorityConfig = (priority) => priorities.find(p => p.value === priority) || priorities[1];

  const getCategoryTheme = (category) => {
    const themes = {
      'General': { gradient: 'from-[#334155] to-[#0f172a]', icon: FiFileText },
      'Employee': { gradient: 'from-[#3FA9F5] to-[#0D47A1]', icon: FiUser },
      'Client': { gradient: 'from-[#1E88E5] to-[#0D47A1]', icon: FiTag },
      'HR Policy': { gradient: 'from-[#6d28d9] to-[#4c1d95]', icon: FiShield },
      'Meeting': { gradient: 'from-amber-600 to-orange-800', icon: FiCalendar },
      'Reminder': { gradient: 'from-orange-600 to-red-800', icon: FiClock },
      'Important': { gradient: 'from-[#be123c] to-[#4c0519]', icon: FiAlertCircle },
    };
    return themes[category] || { gradient: 'from-[#3FA9F5] to-[#0D47A1]', icon: FiMessageSquare };
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (view === 'edit' && editNote) {
      setNotes(prev => prev.map(n => n.id === editNote.id ? { ...editNote, ...newNote, updatedAt: new Date().toISOString().split('T')[0] } : n));
    } else {
      const note = {
        id: notes.length + 1,
        ...newNote,
        createdBy: 'Lead Manager',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setNotes(prev => [note, ...prev]);
    }
    setView('list');
    setEditNote(null);
    setNewNote({ title: '', content: '', category: 'General', priority: 'Normal' });
  };

  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex justify-between items-center text-left">
          <div className="space-y-3">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-48 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
          <div className={`h-12 w-40 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        </div>
        <div className="flex flex-col gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-32 rounded-[2.5rem] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[600px] font-[Outfit] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-12"
          >
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiMessageSquare className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1" id="notes-hub-title">
                    Notes Hub
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <span className="text-sm">
                      Strategy Archives • {notes.length} Active Records
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('add')}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.2rem] font-black shadow-xl shadow-blue-500/30 transition-all text-[11px]"
              >
                <FiPlus className="w-4 h-4" />
                Initiate Note
              </motion.button>
            </div>

            {/* Filter Suite */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col lg:flex-row gap-4 p-4 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-white shadow-xl shadow-blue-500/5'}`}
            >
              <div className="relative flex-1 group">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Scan Intelligence Repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full bg-white dark:bg-slate-800 rounded-2xl border-none px-14 py-4 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm transition-all shadow-sm`}
                />
              </div>
              <div className="relative min-w-[200px]">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full bg-white dark:bg-slate-800 rounded-2xl border-none px-6 py-4 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm transition-all shadow-sm cursor-pointer appearance-none`}
                >
                  <option value="all">Category Registry</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </motion.div>

            {/* Note Intelligence Feed (Horizontal List) */}
            <div className="flex flex-col gap-6 pb-12">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note, index) => {
                  const priorityConfig = getPriorityConfig(note.priority);
                  const theme = getCategoryTheme(note.category);
                  const Icon = theme.icon;
                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative overflow-hidden rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800/50 hover:border-blue-500/30' : 'bg-white border-slate-100 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:border-blue-200'
                        }`}
                      onClick={() => { setEditNote(note); setNewNote(note); setView('edit'); }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
                      <div className={`h-1.5 bg-gradient-to-r ${theme.gradient}`}></div>

                      <div className="p-8 px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-left">
                        <div className="flex-1 min-w-[300px]">
                          <div className="flex items-center gap-4 mb-3 text-left">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-xl shadow-blue-500/10`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-2xl capitalize group-hover:text-blue-500 transition-colors text-left">{note.title}</h3>
                          </div>
                          <p className={`text-base font-bold line-clamp-2 leading-relaxed text-left capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {note.content}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex flex-col gap-2 text-left">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-100 w-fit`}>
                              {note.category}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${priorityConfig.gradient} text-white w-fit shadow-lg`}>
                              {priorityConfig.label}
                            </span>
                          </div>

                          <div className={`flex flex-col items-end gap-1 text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span className="flex items-center gap-1.5"><FiUser className="w-4 h-4 text-blue-500" /> {note.createdBy}</span>
                            <span className="flex items-center gap-1.5"><FiCalendar className="w-4 h-4 text-blue-500" /> {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); setEditNote(note); setNewNote(note); setView('edit'); }}
                              className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-blue-50 text-blue-600'}`}
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                              className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-rose-900/30 hover:bg-rose-900/50' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredNotes.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                <p className="text-lg font-black text-slate-300 uppercase tracking-widest">No Intelligence Records Found</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {(view === 'add' || view === 'edit') && (
          <motion.div
            key="form"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            <div className="flex flex-col gap-8 text-left">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => { setView('list'); setEditNote(null); }}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Hub
              </motion.button>
              <div className="flex items-center gap-6">
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20">
                  {view === 'edit' ? <FiEdit2 className="w-12 h-12 text-white" /> : <FiPlus className="w-12 h-12 text-white" />}
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="text-5xl font-black tracking-tight leading-none capitalize">{view === 'edit' ? 'Update Intelligence' : 'Draft Note'}</h2>
                  <p className="text-sm font-bold text-[#3FA9F5] mt-4 ml-1 uppercase tracking-widest underline underline-offset-8 text-left">Strategy Protocol Entry</p>
                </div>
              </div>
            </div>

            <div className={`p-16 rounded-[4rem] border-2 text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/10'}`}>
              <form onSubmit={handleSaveNote} className="space-y-12">
                <div className="grid grid-cols-1 gap-12 text-left">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Protocol Title</label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="Enter Strategic Theme"
                      className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div className="space-y-4 text-left">
                      <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Category Registry</label>
                      <select
                        value={newNote.category}
                        onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                        className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4 text-left">
                      <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Priority Protocol</label>
                      <select
                        value={newNote.priority}
                        onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                        className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                      >
                        {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Intelligence Content</label>
                    <textarea
                      rows={6}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Deploy critical information here..."
                      className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-16 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[13px] shadow-2xl shadow-blue-500/40"
                  >
                    {view === 'edit' ? 'Verify Updates' : 'Deploy Strategic Note'}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setView('list'); setEditNote(null); }}
                    className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[13px] shadow-2xl"
                  >
                    Abort Protocol
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesTab;