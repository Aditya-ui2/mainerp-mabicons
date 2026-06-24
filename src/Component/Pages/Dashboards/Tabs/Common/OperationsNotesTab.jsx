import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search,
  X, Pencil,
  FileText, Loader2, Trash2
} from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../../service/api';

const OperationsNotesTab = () => {
  // Hardcoded for Operations
  const department = 'HR Operations';

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editNote, setEditNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [detailEditForm, setDetailEditForm] = useState({ title: '', content: '' });
  const [view, setView] = useState('list');

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

  // Auto-refresh every 5 seconds for Operations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotes(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchNotes]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: newNote.title,
        content: newNote.content,
        department: department,
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
    <div className="min-h-screen bg-[#FDFDFD] text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      <div className="w-full" style={{ fontFamily: "'Calibri', sans-serif" }}>
        <>
          {/* Note Detail Drawer */}
          {createPortal(
            <AnimatePresence>
              {selectedNote && (
                <>
                  <div
                    className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-md z-[2000] transition-opacity"
                    onClick={() => setSelectedNote(null)}
                  />
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] bg-white shadow-2xl z-[2001] border-l border-[#F4F3EF] flex flex-col overflow-hidden text-left"
                  >
                    {/* Drawer Header */}
                    <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                      <div className="flex-1 mr-4 text-left">
                        {isEditingDetail ? (
                          <input
                            type="text"
                            value={detailEditForm.title}
                            onChange={(e) => setDetailEditForm({ ...detailEditForm, title: e.target.value })}
                            className="w-full text-2xl font-bold text-[#1A1A2E] font-syne bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
                            placeholder="Note Title..."
                            autoFocus
                          />
                        ) : (
                          <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne truncate">
                            {selectedNote.title}
                          </h2>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {isEditingDetail ? (
                          <>
                            <button
                              onClick={handleDetailSave}
                              disabled={saving}
                              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 shadow-md shadow-blue-500/20 disabled:opacity-50"
                              title="Save Changes"
                            >
                              {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                            </button>
                            <button
                              onClick={() => setIsEditingDetail(false)}
                              className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
                              title="Cancel"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setIsEditingDetail(true);
                                setDetailEditForm({ title: selectedNote.title, content: selectedNote.content });
                              }}
                              className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#1B4DA0] transition-all active:scale-90 shadow-sm"
                              title="Edit Note"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => setSelectedNote(null)}
                              className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 shadow-sm"
                              title="Close"
                            >
                              <X size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 p-10 pt-6 space-y-6 overflow-y-auto pb-10 custom-scrollbar text-left scroll-smooth">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3 mb-2 justify-start text-left">
                          <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/5 flex items-center justify-center text-[#0D47A1]">
                            <FileText size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-widest text-left">DESCRIPTION</h4>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm text-left">
                          {isEditingDetail ? (
                            <textarea
                              value={detailEditForm.content}
                              onChange={(e) => setDetailEditForm({ ...detailEditForm, content: e.target.value })}
                              className="w-full min-h-[300px] text-[#475569] text-[15px] leading-[1.8] font-medium bg-transparent border-none focus:ring-0 p-0 resize-none custom-scrollbar"
                              placeholder="Type your notes here..."
                            />
                          ) : (
                            <p className="text-[#475569] text-[13.5px] leading-[1.6] font-medium whitespace-pre-wrap text-left opacity-90">
                              {selectedNote.content}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-8 border-t border-[#F4F3EF] flex flex-col gap-4">
                        {isEditingDetail ? (
                          <div className="flex gap-4">
                            <button
                              onClick={handleDetailSave}
                              disabled={saving}
                              className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save Note
                            </button>
                            <button
                              onClick={() => setIsEditingDetail(false)}
                              className="flex-1 py-4 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setDeleteConfirmId(selectedNote._id || selectedNote.id); setSelectedNote(null); }}
                            className="w-full py-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100"
                          >
                            <Trash2 size={16} /> Delete Note
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}

          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] tracking-tight leading-none mb-1">
                  Notes Hub
                </h1>

              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setView('add')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#0a3a85] transition-colors w-fit"
                >
                  <Plus size={16} /> Add Note
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
              <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
                <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
                <input type="text" placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#FFFFFF] rounded-[32px] border border-[#F4F3EF] shadow-sm relative overflow-hidden text-left">
              <div className="p-8 flex justify-between items-center relative z-10 border-b border-[#F4F3EF] bg-[#FAFAFA]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                    <FileText size={20} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold font-syne text-[#1A1A2E] tracking-tight">Notes</h3>
                </div>
              </div>

              <div className="px-8 py-12 space-y-10 relative z-10">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start">
                      <div className="w-20 lg:w-28 flex-shrink-0 hidden sm:block" />
                      <div className="ml-0 sm:ml-6 lg:ml-8 flex-1 h-32 rounded-[24px] bg-[#FAFAFA] animate-pulse" />
                    </div>
                  ))
                ) : filteredNotes.length === 0 ? (
                  <div className="text-center py-32">
                    <div className="w-24 h-24 bg-[#FAFAFA] rounded-[32px] mx-auto flex items-center justify-center text-[#9B9BAD] mb-8 rotate-3">
                      <FileText size={40} strokeWidth={1.5} />
                    </div>
                    <p className="text-[20px] font-bold font-syne text-[#1A1A2E] capitalize mb-2">No Notes Found</p>
                    <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-[0.2em]">Start by adding an operational note.</p>
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
                          className="flex items-start group relative text-left"
                        >
                          <div className="w-20 lg:w-28 flex-shrink-0 pt-5 text-right pr-6 lg:pr-8 hidden sm:block">
                            <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none">
                              {dateStr}
                            </span>
                          </div>

                          <div className="relative z-10 flex-shrink-0 hidden sm:block">
                            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform duration-500">
                              <FileText size={18} strokeWidth={1.5} />
                            </div>
                          </div>

                          <div className="ml-0 sm:ml-6 lg:ml-8 flex-1">
                            <div
                              className="bg-white p-6 lg:p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm hover:shadow-2xl transition-all duration-500 relative cursor-pointer group-hover:-translate-y-1 text-left"
                              onClick={() => setSelectedNote(note)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="text-[20px] font-bold font-syne text-[#1A1A2E] tracking-tight leading-none mb-2 group-hover:text-[#1B4DA0] transition-colors">
                                    {note.title}
                                  </h4>
                                  <p className="text-[#64748B] text-[13px] font-medium leading-relaxed opacity-80 mt-2 line-clamp-2">
                                    {note.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                </div>
                              </div>
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

          {/* Add/Edit Modal */}
          {createPortal(
            <AnimatePresence>
              {(view === 'add' || view === 'edit') && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
                  onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '' }); }}>
                  <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#1A1A2E] font-syne">
                        {view === 'edit' ? 'Update Note' : 'Create Note'}
                      </h3>
                      <button onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '' }); }}
                        className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveNote} className="p-10 space-y-8">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Title</label>
                        <input
                          type="text"
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                          placeholder="Note title..."
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Content</label>
                        <textarea
                          rows={6}
                          value={newNote.content}
                          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                          placeholder="Note content..."
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none resize-none"
                          required
                        />
                      </div>

                      <div className="pt-4 flex gap-4">
                        <button type="button"
                          onClick={() => { setView('list'); setEditNote(null); setNewNote({ title: '', content: '' }); }}
                          className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                          Cancel
                        </button>
                        <button type="submit" disabled={saving}
                          className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-all flex items-center justify-center gap-2">
                          {saving && <Loader2 size={14} className="animate-spin" />}
                          {view === 'edit' ? 'Update Note' : 'Create Note'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}

          {/* Delete Confirm */}
          {createPortal(
            <AnimatePresence>
              {deleteConfirmId && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                  onClick={() => setDeleteConfirmId(null)}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl w-full max-w-md p-10 text-center shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
                      <Trash2 size={28} className="text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] font-syne mb-2">Delete Note</h3>
                    <p className="text-sm text-[#9B9BAD] mb-8">This action is permanent and cannot be undone.</p>
                    <div className="flex gap-4">
                      <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 font-bold text-[#6B6B7E] bg-[#F4F3EF] rounded-2xl transition-all hover:bg-gray-200">Cancel</button>
                      <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-4 font-bold text-white bg-red-600 rounded-2xl shadow-lg shadow-red-600/20">Delete</button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </>
      </div>
    </div>
  );
};

export default OperationsNotesTab;
