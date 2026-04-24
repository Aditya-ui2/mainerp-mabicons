import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Edit2, Trash2, Search, Calendar, User,
  ArrowLeft, X, Pencil, Check,
  FileText, Loader2, RefreshCw, Clock
} from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../../service/api';


const NotesTab = ({ isDarkMode, selectedClient, department: propDepartment }) => {
  // Use prop if provided, otherwise fallback to localStorage, finally default to Operations
  const department = propDepartment || localStorage.getItem('department') || 'HR Operations';

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [editNote, setEditNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [detailEditForm, setDetailEditForm] = useState({ title: '', content: '' });

  const fetchNotes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getNotes({ department });
      const apiNotes = res.notes || res.data || [];

      const filteredApiNotes = apiNotes.filter(n =>
        n.department &&
        n.department.trim().toLowerCase() === department.trim().toLowerCase()
      );

      setNotes(filteredApiNotes);
    } catch (err) {
      console.error('Failed to load notes:', err);
      if (!silent) setNotes([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Implement 3-second auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotes(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchNotes]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: newNote.title,
        content: newNote.content,
        department: department, // Tag the note with its department
      };

      if (view === 'edit' && editNote) {
        const noteId = editNote._id || editNote.id;
        const res = await updateNote(noteId, payload);
        const updated = res.note || res.data;
        setNotes(prev => prev.map(n => (n._id || n.id) === noteId ? updated : n));
        toast.success('Note updated successfully');
      } else {
        const res = await createNote(payload);
        const created = res.note || res.data;
        setNotes(prev => [created, ...prev]);
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
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => (n._id || n.id) !== id));
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete note');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleDetailSave = async () => {
    if (!detailEditForm.title.trim()) {
      toast.error('Note title is required');
      return;
    }
    setSaving(true);
    try {
      const noteId = selectedNote._id || selectedNote.id;
      const res = await updateNote(noteId, {
        title: detailEditForm.title,
        content: detailEditForm.content,
        department: department
      });

      const updatedNote = res.note || res.data;
      setNotes(prev => prev.map(n => (n._id || n.id) === noteId ? updatedNote : n));
      setSelectedNote(updatedNote);
      setIsEditingDetail(false);
      toast.success('Note updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update note');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      <div className="w-full" style={{ fontFamily: "'Calibri', sans-serif" }}>
        <>
          {/* Note Detail Drawer */}
          <AnimatePresence>
            {selectedNote && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if (isEditingDetail) handleDetailSave();
                    setSelectedNote(null);
                    setIsEditingDetail(false);
                  }}
                  className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 h-full w-full max-w-[650px] bg-white dark:bg-slate-950 z-[1101] shadow-2xl flex flex-col overflow-hidden border-l border-[#F4F3EF] dark:border-slate-800"
                  style={{ boxShadow: '-20px 0 50px rgba(0,0,0,0.15)' }}
                >
                  {/* Header */}
                  <div className="p-10 border-b border-[#F4F3EF] dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between z-10">
                    <div className="text-left flex-1 mr-4">
                      {isEditingDetail ? (
                        <input
                          autoFocus
                          type="text"
                          value={detailEditForm.title}
                          onChange={(e) => setDetailEditForm({ ...detailEditForm, title: e.target.value })}
                          className="text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne bg-transparent border-none focus:ring-0 p-0 w-full"
                          placeholder="Note Title"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne text-left">{selectedNote.title}</h2>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 justify-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] text-left">
                          {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isEditingDetail ? (
                        <>
                          <button
                            onClick={() => { setDeleteConfirmId(selectedNote?._id || selectedNote?.id); setSelectedNote(null); }}
                            className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 text-[#6B6B7E] hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-all flex items-center justify-center shadow-sm"
                            title="Delete Note"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDetailEditForm({ title: selectedNote.title, content: selectedNote.content });
                              setIsEditingDetail(true);
                            }}
                            className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 text-[#6B6B7E] hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#1B4DA0] transition-all flex items-center justify-center shadow-sm"
                            title="Edit Note"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNote(null);
                              setIsEditingDetail(false);
                            }}
                            className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 text-[#6B6B7E] hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                            title="Close Note"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditingDetail(false)}
                            className="px-5 py-2.5 rounded-xl bg-[#F4F3EF] dark:bg-slate-900 text-[#6B6B7E] text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDetailSave}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-sm font-medium hover:bg-[#0a3a85] transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Save Changes
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 text-left">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-[#1B4DA0]">
                          <FileText size={16} />
                        </div>
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Description</span>
                      </div>

                      <div className="bg-[#FAFAFA] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 p-10 min-h-[300px] transition-all duration-300">
                        {isEditingDetail ? (
                          <textarea
                            value={detailEditForm.content}
                            onChange={(e) => setDetailEditForm({ ...detailEditForm, content: e.target.value })}
                            className="w-full min-h-[250px] text-[15px] text-[#4B4B5E] dark:text-slate-300 font-medium leading-[1.8] bg-transparent border-none focus:ring-0 p-0 resize-none custom-scrollbar"
                            placeholder="Type note content here..."
                          />
                        ) : (
                          <div className="text-[15px] text-[#4B4B5E] dark:text-slate-300 font-medium leading-[1.8] whitespace-pre-wrap">
                            {selectedNote.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-1">
                  Notes
                </h1>

              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setView('add')}
                  className="flex items-center center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#0a3a85] transition-colors w-fit"
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
                  <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Notes</h3>
                </div>
              </div>

              {/* Vertical Bridge Line */}
              <div className="absolute left-[116px] sm:left-[128px] top-[100px] bottom-[40px] w-px bg-[#F4F3EF] dark:bg-slate-800 pointer-events-none hidden sm:block" />

              {/* Timeline Content */}
              <div className="px-8 py-12 space-y-8 relative z-10">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 sm:gap-6">
                      <div className="w-16 sm:w-20 flex-shrink-0 hidden sm:block" />
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FAFAFA] dark:bg-slate-800 flex-shrink-0 animate-pulse" />
                      <div className="flex-1 h-28 rounded-[24px] bg-[#FAFAFA] dark:bg-slate-900 animate-pulse" />
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
                          key={note._id || note.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.04 }}
                          className="flex items-center gap-4 sm:gap-6 group relative text-left"
                        >
                          {/* Time Column */}
                          <div className="w-16 sm:w-20 flex-shrink-0 text-right hidden sm:block">
                            <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none">
                              {dateStr}
                            </span>
                          </div>

                          {/* Marker */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform duration-500 shadow-sm">
                              <FileText size={20} strokeWidth={1.5} />
                            </div>
                          </div>

                          {/* Card */}
                          <div className="flex-1">
                            <div
                              className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative cursor-pointer group-hover:-translate-y-1 text-left"
                              onClick={() => setSelectedNote(note)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  {/* Mobile date */}
                                  <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] sm:hidden mb-2 block">
                                    {dateStr}
                                  </span>
                                  <h4 className="text-[18px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-tight mb-2 group-hover:text-[#1B4DA0] transition-colors">
                                    {note.title}
                                  </h4>
                                  <p className="text-[#64748B] dark:text-slate-400 text-[13px] font-medium leading-relaxed opacity-80 line-clamp-2">
                                    {note.content}
                                  </p>
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
          {createPortal(
            <AnimatePresence>
              {(view === 'add' || view === 'edit') && (
                <motion.div key="add-edit-note" className="fixed inset-0 z-[10001] pointer-events-none">
                  <motion.div className="absolute inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 pointer-events-auto"
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
                          className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                          <X size={18} />
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>, document.body
          )}

          {/* Delete Confirmation Modal */}
          {createPortal(
            <AnimatePresence>
              {deleteConfirmId && (
                <motion.div key="delete-note-modal" className="fixed inset-0 z-[10001] pointer-events-none">
                  <motion.div className="absolute inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 pointer-events-auto"
                    onClick={() => setDeleteConfirmId(null)}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-10 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
                          <Trash2 size={28} className="text-rose-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Delete Note</h3>
                          <p className="text-sm text-[#9B9BAD] mt-2">Are you sure you want to delete this note? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-4 rounded-2xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(deleteConfirmId)}
                            className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>, document.body
          )}

        </>
      </div>
    </div>
  );
};

export default NotesTab;
