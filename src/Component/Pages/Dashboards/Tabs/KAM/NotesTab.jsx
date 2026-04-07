import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Edit2, Trash2, Search, Calendar, User,
  ArrowLeft, X,
  FileText, Loader2, RefreshCw
} from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../../service/api';

const NotesTab = ({ isDarkMode, selectedClient }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [editNote, setEditNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

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

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: newNote.title,
        content: newNote.content,
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
      setNewNote({ title: '', content: '' });
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
    });
    setView('edit');
  };

  const filteredNotes = notes.filter(note => {
    return (note.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.content || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      <div className="w-full font-jakarta">
        <>
          <div className="space-y-10">
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
                    <Plus size={16} /> Add Note
                  </motion.button>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-2 border border-[#F4F3EF] dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 bg-[#F4F3EF] dark:bg-slate-800 rounded-2xl px-5 py-3">
                  <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
                  <input type="text" placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-[#1A1A2E] dark:text-white placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
                </div>
              </div>

              {/* Main Timeline Container */}
              <div className="bg-[#FFFFFF] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm relative overflow-hidden text-left">
                
                {/* Timeline Header */}
                <div className="p-8 flex justify-between items-center relative z-10 border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA]/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                      <FileText size={20} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Notes Timeline</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">Active Records</span>
                  </div>
                </div>

                {/* Vertical Bridge Line */}
                <div className="absolute left-[88px] lg:left-[108px] top-[100px] bottom-[40px] w-px bg-[#F4F3EF] dark:bg-slate-800 pointer-events-none hidden sm:block" />

                {/* Timeline Content */}
                <div className="px-8 py-12 space-y-10 relative z-10">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-start">
                        <div className="w-20 lg:w-28 flex-shrink-0 hidden sm:block" />
                        <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] dark:bg-slate-800 flex-shrink-0 animate-pulse hidden sm:block" />
                        <div className="ml-0 sm:ml-6 lg:ml-8 flex-1 h-32 rounded-[24px] bg-[#FAFAFA] dark:bg-slate-900 animate-pulse" />
                      </div>
                    ))
                  ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-32">
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
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredNotes.map((note, index) => {
                        const noteDate = new Date(note.updatedAt || note.createdAt);
                        const dateStr = noteDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();

                        return (
                          <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.04 }}
                            className="flex items-start group relative text-left"
                          >
                            {/* Time Column */}
                            <div className="w-20 lg:w-28 flex-shrink-0 pt-5 text-right pr-6 lg:pr-8 hidden sm:block">
                              <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none">
                                {dateStr}
                              </span>
                            </div>

                            {/* Marker */}
                            <div className="relative z-10 flex-shrink-0 hidden sm:block">
                              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform duration-500">
                                <FileText size={18} strokeWidth={1.5} />
                              </div>
                            </div>

                            {/* Card */}
                            <div className="ml-0 sm:ml-6 lg:ml-8 flex-1">
                              <div
                                className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative cursor-pointer group-hover:-translate-y-1 text-left"
                                onClick={() => handleEdit(note)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="space-y-3 flex-1">
                                    <div>
                                      <h4 className="text-[20px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2 group-hover:text-[#1B4DA0] transition-colors">
                                        {note.title}
                                      </h4>
                                      <p className="text-[#64748B] dark:text-slate-400 text-[13px] font-medium leading-relaxed opacity-80 mt-2 line-clamp-2">
                                        {note.content}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2 ml-4">
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

                                {/* Design Glow */}
                                <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-[#1B4DA0]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
          </div>

          {/* Dialog for Add/Edit Note */}
          <AnimatePresence>
            {(view === 'add' || view === 'edit') && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
                onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '' }); }}>
                <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500"
                  onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {view === 'edit' ? 'Update Note' : 'Create Note'}
                      </h3>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                        Strategy Protocol Entry
                      </p>
                    </div>
                    <button onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '' }); }}
                      className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Body */}
                  <form onSubmit={handleSaveNote} className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Title *</label>
                      <input
                        type="text"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        placeholder="Enter note title..."
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Content *</label>
                      <textarea
                        rows={6}
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        placeholder="Write your note content here..."
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 resize-none placeholder:text-[#9B9BAD]/50"
                        required
                      />
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 flex gap-4">
                      <button type="button"
                        onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '' }); }}
                        className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                        Cancel
                      </button>
                      <button type="submit" disabled={saving}
                        className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {view === 'edit' ? 'Save Changes' : 'Create Note'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </AnimatePresence>
        </>
      </div>
    </div>
  );
};

export default NotesTab;