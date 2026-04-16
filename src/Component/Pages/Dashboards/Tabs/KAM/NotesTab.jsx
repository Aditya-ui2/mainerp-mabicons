import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Edit2, Trash2, Search, Calendar, User,
  ArrowLeft, X, Pencil,
  FileText, Loader2, RefreshCw, Clock
} from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../../service/api';

const MOCK_NOTES_RECRUITMENT = [
  { id: 'nr1', title: 'Sourcing Strategy - Tech', content: 'Focused on LinkedIn Boolean strings and referral loops for high-priority React developer roles.', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'nr2', title: 'Interview Feedback Loop', content: 'Reminder to follow up with internal stakeholders within 24 hours of technical evaluation.', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'nr3', title: 'Client Requirements - TechNexus', description: 'Monthly project status update and requirements gathering for April.', status: 'Pending', priority: 'High', category: 'Client', assignedToName: 'Manju', dueDate: new Date().toISOString() },
];

const MOCK_NOTES_OPERATIONS = [
  { id: 'no1', title: 'New Remote Policy', content: 'Details on the hybrid model (3 days office, 2 days home) for the FY24 cycle.', createdAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'no2', title: 'Payroll Compliance Check', content: 'Mandatory review of PF and ESI contributions for the newly onboarded batch.', createdAt: new Date(Date.now() - 129600000).toISOString(), updatedAt: new Date(Date.now() - 129600000).toISOString() },
];

const NotesTab = ({ isDarkMode, selectedClient, department: propDepartment }) => {
  // Use prop if provided, otherwise fallback to localStorage, finally default to Operations
  const department = propDepartment || localStorage.getItem('department') || 'HR Operations';
  
  const [notes, setNotes] = useState(department === 'HR Recruitment' ? MOCK_NOTES_RECRUITMENT : MOCK_NOTES_OPERATIONS);
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

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      // Pass department to the API to fetch only relevant notes
      const res = await getNotes({ department });
      const apiNotes = res.notes || [];
      
      // Secondary filter to ensure strict isolation in the UI
      const filteredApiNotes = apiNotes.filter(n => 
        n.department && 
        n.department.trim().toLowerCase() === department.trim().toLowerCase()
      );
      
      const mockNotes = department === 'HR Recruitment' ? MOCK_NOTES_RECRUITMENT : MOCK_NOTES_OPERATIONS;
      setNotes([...mockNotes, ...filteredApiNotes]);
    } catch (err) {
      console.error('Failed to load notes:', err);
      const mockNotes = department === 'HR Recruitment' ? MOCK_NOTES_RECRUITMENT : MOCK_NOTES_OPERATIONS;
      setNotes(mockNotes);
    } finally {
      setLoading(false);
    }
  }, [department]);

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
        department: department, // Tag the note with its department
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
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
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
      const res = await updateNote(selectedNote.id, {
        title: detailEditForm.title,
        content: detailEditForm.content,
        department: department
      });
      
      // Update local states
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? res.note : n));
      setSelectedNote(res.note);
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
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity"
                  onClick={() => setSelectedNote(null)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] bg-white dark:bg-slate-950 shadow-2xl z-[9999] border-l border-[#F4F3EF] dark:border-slate-800 flex flex-col overflow-hidden text-left"
                >
                  {/* Drawer Header */}
                  <div className="sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-[#F4F3EF] dark:border-slate-800 px-8 py-6 flex items-center justify-between z-20">
                    <div className="flex-1 mr-4 text-left">
                      {isEditingDetail ? (
                        <input
                          type="text"
                          value={detailEditForm.title}
                          onChange={(e) => setDetailEditForm({ ...detailEditForm, title: e.target.value })}
                          className="w-full text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
                          placeholder="Note Title..."
                          autoFocus
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne truncate">
                          {selectedNote.title}
                        </h2>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 justify-start text-left">
                        <span className="text-[10px] font-bold text-[#0D47A1] uppercase tracking-[3px]">Protocol Entry</span>
                        <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{department}</span>
                      </div>
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
                             {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} className="rotate-45 scale-125" style={{ transform: 'rotate(0deg)' }} />}
                           </button>
                           <button
                             onClick={() => setIsEditingDetail(false)}
                             className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-900 text-[#6B6B7E] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-90"
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
                             className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-900 text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#1B4DA0] transition-all active:scale-90 shadow-sm"
                             title="Edit Note"
                           >
                             <Pencil size={18} />
                           </button>
                           <button
                             onClick={() => setSelectedNote(null)}
                             className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-900 text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all active:scale-90 shadow-sm"
                             title="Close"
                           >
                             <X size={20} />
                           </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 p-8 space-y-8 overflow-y-auto pb-10 custom-scrollbar text-left scroll-smooth">
                    {/* Note Snapshot */}
                    <div className="bg-[#FAFAF8] dark:bg-slate-900/50 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 p-8 space-y-8">
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-8 border-b border-[#F4F3EF] dark:border-slate-800 pb-8">
                            <div className="space-y-1 text-left">
                              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left">Created On</span>
                              <div className="flex items-center gap-2 text-[#1A1A2E] dark:text-white font-bold text-sm justify-start">
                                <Calendar size={14} className="text-[#1B4DA0]" />
                                {new Date(selectedNote.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                            <div className="space-y-1 text-left">
                              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left">Last Activity</span>
                              <div className="flex items-center gap-2 text-[#1A1A2E] dark:text-white font-bold text-sm justify-start">
                                <Clock size={14} className="text-[#1B4DA0]" />
                                {new Date(selectedNote.updatedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 text-left">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left">Security Header</span>
                            <div className="flex flex-wrap gap-2 justify-start">
                               <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-lg text-[10px] font-bold text-[#1B4DA0] uppercase tracking-widest shadow-sm">
                                  {department.split(' ')[1] || department}
                               </span>
                               <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-lg text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">
                                  Active Record
                               </span>
                            </div>
                          </div>
                       </div>
                    </div>

                    {/* Full Description */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-3 mb-2 justify-start text-left">
                         <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/5 flex items-center justify-center text-[#0D47A1]">
                            <FileText size={16} />
                         </div>
                         <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest text-left">Note Intelligence</h4>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm text-left">
                        {isEditingDetail ? (
                          <textarea
                            value={detailEditForm.content}
                            onChange={(e) => setDetailEditForm({ ...detailEditForm, content: e.target.value })}
                            className="w-full min-h-[300px] text-[#475569] dark:text-slate-300 text-[15px] leading-[1.8] font-medium bg-transparent border-none focus:ring-0 p-0 resize-none custom-scrollbar"
                            placeholder="Type your findings here..."
                          />
                        ) : (
                          <p className="text-[#475569] dark:text-slate-300 text-[15px] leading-[1.8] font-medium whitespace-pre-wrap text-left">
                            {selectedNote.content}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="pt-8 border-t border-[#F4F3EF] dark:border-slate-800 flex flex-col gap-4">
                        {isEditingDetail ? (
                           <div className="flex gap-4">
                              <button
                                onClick={handleDetailSave}
                                disabled={saving}
                                className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                              >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} style={{ transform: 'rotate(0deg)' }} />} Save Note
                              </button>
                              <button
                                onClick={() => setIsEditingDetail(false)}
                                className="flex-1 py-4 rounded-2xl bg-[#F4F3EF] dark:bg-slate-800 text-[#6B6B7E] text-xs font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                              >
                                Cancel
                              </button>
                           </div>
                        ) : (
                          <button
                            onClick={() => { setDeleteConfirmId(selectedNote.id); setSelectedNote(null); }}
                            className="w-full py-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/30"
                          >
                            <Trash2 size={16} /> Delete Intelligence Note
                          </button>
                        )}
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
                    Notes Hub
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
                    <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Notes Timeline</h3>
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
                                onClick={() => setSelectedNote(note)}
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
              </div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
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
              </div>
            )}
          </AnimatePresence>
          
        </>
      </div>
    </div>
  );
};

export default NotesTab;