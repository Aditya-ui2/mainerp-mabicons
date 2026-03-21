import { useState, useEffect } from 'react';
import { FiFileText, FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiUser, FiTag, FiChevronDown, FiX, FiBookmark, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const NotesTab = ({ isDarkMode, selectedClient }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General', priority: 'normal' });
  const [hoveredNote, setHoveredNote] = useState(null);

  const categories = ['General', 'Employee', 'Client', 'HR Policy', 'Meeting', 'Reminder', 'Important'];
  const priorities = [
    { value: 'low', label: 'Low', gradient: 'from-blue-500 to-cyan-600' },
    { value: 'normal', label: 'Normal', gradient: 'from-emerald-500 to-teal-600' },
    { value: 'high', label: 'High', gradient: 'from-amber-500 to-orange-600' },
    { value: 'urgent', label: 'Urgent', gradient: 'from-rose-500 to-pink-600' },
  ];

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Quarterly Review Meeting', content: 'Schedule performance reviews for Q1 2026. Ensure all managers submit their reports by March 25th.', category: 'Meeting', priority: 'high', createdBy: 'Admin', createdAt: '2026-03-15', updatedAt: '2026-03-15' },
      { id: 2, title: 'New Leave Policy Update', content: 'The new leave policy will be effective from April 1st. All employees should acknowledge the policy changes.', category: 'HR Policy', priority: 'urgent', createdBy: 'HR Manager', createdAt: '2026-03-14', updatedAt: '2026-03-14' },
      { id: 3, title: 'Client ABC Requirements', content: 'Client ABC needs additional resources for the new project. Discuss with team lead about allocation.', category: 'Client', priority: 'normal', createdBy: 'Project Manager', createdAt: '2026-03-12', updatedAt: '2026-03-13' },
      { id: 4, title: 'Employee Training Schedule', content: 'Technical training sessions scheduled for next week. All engineering team members should attend.', category: 'Employee', priority: 'normal', createdBy: 'Training Head', createdAt: '2026-03-10', updatedAt: '2026-03-10' },
      { id: 5, title: 'Office Maintenance', content: 'AC maintenance scheduled for March 20th. Office will close early at 5 PM.', category: 'General', priority: 'low', createdBy: 'Admin', createdAt: '2026-03-08', updatedAt: '2026-03-08' },
    ];
    setTimeout(() => {
      setNotes(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getPriorityConfig = (priority) => priorities.find(p => p.value === priority) || priorities[1];

  const getCategoryGradient = (category) => {
    const gradients = {
      'General': 'from-slate-500 to-slate-600',
      'Employee': 'from-violet-500 to-purple-600',
      'Client': 'from-blue-500 to-indigo-600',
      'HR Policy': 'from-emerald-500 to-teal-600',
      'Meeting': 'from-amber-500 to-orange-600',
      'Reminder': 'from-orange-500 to-red-600',
      'Important': 'from-rose-500 to-pink-600',
    };
    return gradients[category] || 'from-slate-500 to-slate-600';
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (editNote) {
      setNotes(prev => prev.map(n => n.id === editNote.id ? { ...editNote, ...newNote, updatedAt: new Date().toISOString().split('T')[0] } : n));
    } else {
      const note = {
        id: notes.length + 1,
        ...newNote,
        createdBy: 'Current User',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setNotes(prev => [note, ...prev]);
    }
    setShowAddModal(false);
    setEditNote(null);
    setNewNote({ title: '', content: '', category: 'General', priority: 'normal' });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-56 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={`h-56 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <FiMessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Notes
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Keep track of important information
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowAddModal(true); setEditNote(null); setNewNote({ title: '', content: '', category: 'General', priority: 'normal' }); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25"
        >
          <FiPlus className="w-4 h-4" />
          Add Note
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-amber-500/50 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Notes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredNotes.map((note, index) => {
            const priorityConfig = getPriorityConfig(note.priority);
            return (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {/* Top gradient accent */}
                <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(note.category)}`}></div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-lg line-clamp-1">{note.title}</h3>
                    <div className={`flex gap-1 transition-opacity ${hoveredNote === note.id ? 'opacity-100' : 'opacity-0'}`}>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setEditNote(note); setNewNote(note); setShowAddModal(true); }}
                        className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                      >
                        <FiEdit2 className="w-4 h-4 text-slate-500" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(note.id)}
                        className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-rose-900/30' : 'hover:bg-rose-100'}`}
                      >
                        <FiTrash2 className="w-4 h-4 text-rose-500" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <p className={`text-sm line-clamp-3 mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {note.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${getCategoryGradient(note.category)} text-white`}>
                      <FiTag className="w-3 h-3" />{note.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${priorityConfig.gradient} text-white capitalize`}>
                      {note.priority}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between text-xs pt-4 border-t ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <span className="flex items-center gap-1.5 font-medium"><FiUser className="w-3.5 h-3.5" /> {note.createdBy}</span>
                    <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> {new Date(note.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 w-fit mx-auto mb-4 shadow-lg">
            <FiFileText className="w-8 h-8 text-white" />
          </div>
          <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No notes found</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Create a new note to get started</p>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowAddModal(false); setEditNote(null); }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-3xl"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {editNote ? <FiEdit2 className="w-5 h-5 text-amber-500" /> : <FiPlus className="w-5 h-5 text-amber-500" />}
                    {editNote ? 'Edit Note' : 'Add New Note'}
                  </h3>
                  <button onClick={() => { setShowAddModal(false); setEditNote(null); }} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSaveNote} className="space-y-5">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Title</label>
                    <input 
                      type="text" 
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} 
                      placeholder="Note title"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                      <select 
                        value={newNote.category}
                        onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                        className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Priority</label>
                      <select 
                        value={newNote.priority}
                        onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                        className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}
                      >
                        {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Content</label>
                    <textarea 
                      rows={4}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} 
                      placeholder="Note content..."
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button" 
                      onClick={() => { setShowAddModal(false); setEditNote(null); }} 
                      className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25"
                    >
                      {editNote ? 'Update' : 'Save'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesTab;
