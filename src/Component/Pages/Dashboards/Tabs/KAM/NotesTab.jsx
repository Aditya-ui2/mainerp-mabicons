import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  MessageSquare, Plus, Edit2, Trash2, Search, Calendar, User,
  Tag, ChevronDown, ArrowLeft, ShieldCheck,
  FileText, Clock, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../../service/api';

const NotesTab = ({ isDarkMode, selectedClient }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState('list');
  const [editNote, setEditNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General', priority: 'Normal' });

  const categories = ['General', 'Employee', 'Client', 'HR Policy', 'Meeting', 'Reminder', 'Important'];
  const priorities = [
    { value: 'Low', label: 'Monitor Only', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
    { value: 'Normal', label: 'Standard Pulse', color: 'text-[#1B4DA0]', bg: 'bg-[#EEF2FB]' },
    { value: 'High', label: 'Critical Path', color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' },
    { value: 'Urgent', label: 'Priority Action', color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' },
  ];

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotes();
      setNotes(res.notes || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const getPriorityConfig = (priority) => {
    const normalized = priority ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : 'Normal';
    return priorities.find(p => p.value === normalized) || priorities[1];
  };

  const getCategoryTheme = (category) => {
    const themes = {
      'General': { color: 'text-[#64748B]', bg: 'bg-[#F8FAFC]', icon: FileText },
      'Employee': { color: 'text-[#1B4DA0]', bg: 'bg-[#EEF2FB]', icon: User },
      'Client': { color: 'text-[#0891B2]', bg: 'bg-[#ECFEFF]', icon: Tag },
      'HR Policy': { color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]', icon: ShieldCheck },
      'Meeting': { color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]', icon: Calendar },
      'Reminder': { color: 'text-[#E11D48]', bg: 'bg-[#FFF1F2]', icon: Clock },
      'Important': { color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', icon: AlertCircle },
    };
    return themes[category] || { color: 'text-[#1B4DA0]', bg: 'bg-[#EEF2FB]', icon: MessageSquare };
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        priority: newNote.priority.toLowerCase(), // DB ENUM expects lowercase: low/normal/high/urgent
      };

      if (view === 'edit' && editNote) {
        const res = await updateNote(editNote.id, payload);
        setNotes(prev => prev.map(n => n.id === editNote.id ? res.note : n));
        toast.success('Note updated successfully');
      } else {
        const res = await createNote(payload);
        setNotes(prev => [res.note, ...prev]);
        toast.success('Note created successfully');
      }

      setView('list');
      setEditNote(null);
      setNewNote({ title: '', content: '', category: 'General', priority: 'Normal' });
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete note');
    }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority ? note.priority.charAt(0).toUpperCase() + note.priority.slice(1).toLowerCase() : 'Normal',
    });
    setView('edit');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = (note.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      <div className="w-full font-jakarta">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-10"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                  <h1 className="text-[36px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-1">Notes Hub</h1>
                  <p className="text-[#9B9BAD] text-sm mt-2 font-medium tracking-wide">
                    Strategy archives
                    {!loading && <span> • {notes.length} Active Records</span>}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchNotes}
                    disabled={loading}
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFF] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="Refresh"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setView('add')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-colors w-fit"
                  >
                    <Plus size={16} /> Initiate Note
                  </motion.button>
                </div>
              </div>

              {/* Filter Suite */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-4 p-4 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#FAFAFA] dark:bg-slate-800 rounded-2xl border border-transparent focus:border-[#1B4DA0]/20 px-14 py-4 focus:ring-4 focus:ring-[#1B4DA0]/5 font-bold text-sm text-[#1A1A2E] dark:text-white transition-all outline-none placeholder-[#9B9BAD]"
                  />
                </div>
                <div className="relative min-w-[220px]">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-[#FAFAFA] dark:bg-slate-800 rounded-2xl border border-transparent focus:border-[#1B4DA0]/20 px-6 py-4 focus:ring-4 focus:ring-[#1B4DA0]/5 font-bold text-sm text-[#1A1A2E] dark:text-white transition-all outline-none cursor-pointer appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={18} />
                </div>
              </motion.div>

              {/* Note Cards */}
              <div className="flex flex-col gap-5 relative z-10">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-40 rounded-[32px] bg-[#FAFAFA] dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 animate-pulse" />
                  ))
                ) : filteredNotes.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="w-24 h-24 bg-[#FAFAFA] dark:bg-slate-800 rounded-[32px] mx-auto flex items-center justify-center text-[#9B9BAD] mb-8 rotate-3">
                      <FileText size={40} strokeWidth={1.5} />
                    </div>
                    <p className="text-[20px] font-bold font-syne text-[#1A1A2E] dark:text-white capitalize mb-2">No Records Found</p>
                    <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-[0.2em]">Silence across the intelligence repository.</p>
                    <button
                      onClick={() => setView('add')}
                      className="mt-8 px-6 py-3 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-colors"
                    >
                      Create First Note
                    </button>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredNotes.map((note, index) => {
                      const priorityConfig = getPriorityConfig(note.priority);
                      const theme = getCategoryTheme(note.category);
                      const Icon = theme.icon;

                      return (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.04 }}
                          className="bg-white dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative group cursor-pointer"
                          onClick={() => handleEdit(note)}
                        >
                          <div className="p-8 lg:p-10 relative z-10 flex flex-col lg:flex-row justify-between gap-8 group-hover:-translate-y-1 transition-transform duration-500">

                            <div className="flex-1 min-w-[300px]">
                              <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${theme.bg} flex items-center justify-center`}>
                                  <Icon className={`w-6 h-6 ${theme.color}`} strokeWidth={2} />
                                </div>
                                <div>
                                  <h3 className="text-[20px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2 group-hover:text-[#1B4DA0] transition-colors">{note.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">
                                      <User size={10} className="inline mr-1" />
                                      {note.createdByName || 'Team'}
                                    </span>
                                    <span className="text-[#9B9BAD]">•</span>
                                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">
                                      <Calendar size={10} className="inline mr-1" />
                                      {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[14px] font-medium text-[#64748B] dark:text-slate-400 leading-relaxed pr-8 line-clamp-2">
                                {note.content}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 flex-shrink-0">
                              <div className="flex flex-col gap-3">
                                <span className="inline-flex px-3 py-1.5 rounded-lg bg-[#F8FAFF] dark:bg-slate-800 border border-[#EEF2FB] dark:border-slate-700 text-[#1B4DA0] dark:text-blue-400 text-[9px] font-bold uppercase tracking-[0.15em] text-center w-full justify-center">
                                  {note.category}
                                </span>
                                <span className={`inline-flex px-3 py-1.5 rounded-lg border border-transparent ${priorityConfig.bg} ${priorityConfig.color} text-[9px] font-bold uppercase tracking-[0.15em] text-center w-full justify-center`}>
                                  {priorityConfig.label}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFF] transition-all shadow-sm"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 text-[#9B9BAD] hover:text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#FEE2E2] transition-all shadow-sm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Hover Glow */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#1B4DA0]/0 rounded-[32px] blur-3xl group-hover:bg-[#1B4DA0]/5 transition-colors duration-700 pointer-events-none" />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}

          {(view === 'add' || view === 'edit') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-10"
            >
              <div className="flex flex-col gap-8">
                <button
                  onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '', category: 'General', priority: 'Normal' }); }}
                  className="flex items-center gap-2 w-fit px-6 py-3 rounded-full border border-[#F4F3EF] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-[#F8FAFF] transition-all font-bold text-[11px] uppercase tracking-widest shadow-sm"
                >
                  <ArrowLeft size={14} /> Return To Hub
                </button>

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[20px] bg-[#1B4DA0] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                    {view === 'edit' ? <Edit2 size={24} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h2 className="text-[36px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2">
                      {view === 'edit' ? 'Update Note' : 'Draft Note'}
                    </h2>
                    <p className="text-[12px] font-bold text-[#1B4DA0] uppercase tracking-[0.2em]">Strategy Protocol Entry</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <form onSubmit={handleSaveNote} className="space-y-10 relative z-10">

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em]">Title *</label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="Enter note title..."
                      className="w-full bg-[#FAFAFA] dark:bg-slate-800 rounded-[22px] border border-transparent focus:border-[#1B4DA0]/20 px-6 py-5 focus:ring-4 focus:ring-[#1B4DA0]/5 font-bold text-[16px] text-[#1A1A2E] dark:text-white transition-all outline-none placeholder-[#9B9BAD]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em]">Category</label>
                      <select
                        value={newNote.category}
                        onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                        className="w-full bg-[#FAFAFA] dark:bg-slate-800 rounded-[22px] border border-transparent focus:border-[#1B4DA0]/20 px-6 py-5 font-bold text-[15px] text-[#1A1A2E] dark:text-white transition-all outline-none cursor-pointer appearance-none"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em]">Priority</label>
                      <select
                        value={newNote.priority}
                        onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                        className="w-full bg-[#FAFAFA] dark:bg-slate-800 rounded-[22px] border border-transparent focus:border-[#1B4DA0]/20 px-6 py-5 font-bold text-[15px] text-[#1A1A2E] dark:text-white transition-all outline-none cursor-pointer appearance-none"
                      >
                        {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em]">Content *</label>
                    <textarea
                      rows={6}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Write your note content here..."
                      className="w-full bg-[#FAFAFA] dark:bg-slate-800 rounded-[22px] border border-transparent focus:border-[#1B4DA0]/20 px-6 py-5 font-bold text-[15px] text-[#1A1A2E] dark:text-white transition-all outline-none placeholder-[#9B9BAD] resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-10 py-4 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-colors active:scale-95 disabled:opacity-60"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      {view === 'edit' ? 'Save Changes' : 'Create Note'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '', category: 'General', priority: 'Normal' }); }}
                      className="px-8 py-4 bg-white dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 text-[#9B9BAD] rounded-full text-[11px] font-bold uppercase tracking-[0.15em] shadow-sm hover:text-[#1A1A2E] hover:bg-[#F8FAFF] transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-[#1B4DA0]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#1B4DA0]/10 transition-colors duration-1000" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotesTab;