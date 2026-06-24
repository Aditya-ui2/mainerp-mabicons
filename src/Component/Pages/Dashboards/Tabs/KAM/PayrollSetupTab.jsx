import { useState } from 'react';
import { FiPlus, FiDownload, FiUploadCloud, FiFileText, FiTrash2, FiExternalLink, FiEye } from 'react-icons/fi';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const PayrollSetupTab = ({ isDarkMode }) => {
  const [activeSubTab, setActiveSubTab] = useState('Pay Item Group'); // 'Pay Item Group', 'Payroll Repository', 'Payslip Gallery'
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('Earnings');

  // Local state for Pay Item Groups
  const [payGroups, setPayGroups] = useState([
    { id: 'g1', name: 'Payslip Group', type: 'System', items: 8, description: 'Standard grouping shown on printed employee payslips.' },
    { id: 'g2', name: 'Reimbursement Group', type: 'System', items: 3, description: 'Travel, medical, and client expense claim components.' },
    { id: 'g3', name: 'Salary Master Group', type: 'System', items: 6, description: 'Aggregated components forming the CTC structure.' },
    { id: 'g4', name: 'Gross Group', type: 'System', items: 5, description: 'Sum total of all earnings before statutory deductions.' },
    { id: 'g5', name: 'Deduction Group', type: 'System', items: 4, description: 'Includes PF, ESI, TDS, and other recovery parameters.' },
    { id: 'g6', name: 'One Time Payment Group', type: 'Custom', items: 2, description: 'Performance bonuses and referral pay components.' },
    { id: 'g7', name: 'One Time Deduction Group', type: 'Custom', items: 1, description: 'Asset damage recovery and advance salary adjustments.' },
    { id: 'g8', name: 'Income Tax', type: 'System', items: 12, description: 'TDS calculations under Old and New tax regimes.' },
    { id: 'g9', name: 'PF Group', type: 'System', items: 2, description: 'Employer and Employee provident fund configurations.' },
  ]);

  // Repository files state
  const [repoFiles, setRepoFiles] = useState([
    { id: 'f1', name: 'Statutory_Compliance_Rules_2026.pdf', size: '1.4 MB', date: '2026-04-10' },
    { id: 'f2', name: 'HDFC_Bank_Upload_Format_v2.xlsx', size: '34 KB', date: '2026-05-15' },
    { id: 'f3', name: 'Salary_Structure_Policy_Mabicons.pdf', size: '890 KB', date: '2026-06-01' }
  ]);

  // Payslip templates state
  const [selectedTemplate, setSelectedTemplate] = useState('Classic Ledger');
  const templates = [
    { name: 'Classic Ledger', desc: 'Detailed columns showing earnings/deductions side-by-side with statutory notes.', previewBg: 'bg-slate-50' },
    { name: 'Modern Elegant', desc: 'Compact clean layout using modern typography and primary color accents.', previewBg: 'bg-blue-50/40' },
    { name: 'Minimal Corporate', desc: 'High-end minimal aesthetics with signature block and barcode visuals.', previewBg: 'bg-zinc-50' }
  ];

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    const newGroup = {
      id: `g-${Date.now()}`,
      name: newGroupName,
      type: newGroupType,
      items: 0,
      description: `Custom ${newGroupType.toLowerCase()} pay item configuration group.`
    };
    setPayGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setShowCreateGroupModal(false);
    toast.success(`Group "${newGroupName}" created successfully`);
  };

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-5 border-[#F4F3EF] dark:border-slate-800 gap-4 text-left">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Payroll Setup</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Configure pay groupings, statutory parameters, and payslip visuals</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FAF9F6] dark:bg-slate-850 p-1.5 rounded-2xl flex items-center border border-[#F4F3EF] dark:border-slate-800">
            {['Pay Item Group', 'Payroll Repository', 'Payslip Gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === tab 
                    ? 'bg-white dark:bg-slate-900 text-[#0D47A1] dark:text-blue-400 shadow-sm font-black' 
                    : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeSubTab === 'Pay Item Group' && (
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold shadow-md hover:bg-[#0a3a82] transition-all active:scale-95 shrink-0"
            >
              <FiPlus size={14} /> Create Group
            </button>
          )}
        </div>
      </div>

      {/* Render Sub Tabs */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'Pay Item Group' && (
          <motion.div
            key="pay-item-group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Help Callout */}
            <div className={`p-6 rounded-[28px] border text-left relative transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-350' : 'bg-white border-[#F4F3EF] shadow-sm text-slate-500'}`}>
              <p className="text-xs font-semibold leading-relaxed pr-16">
                The <span className="font-bold text-[#1A1A2E] dark:text-white">Pay Item Groups</span> are logical groupings of Payroll components. greytHR provides system-defined groups and also the option to create custom groupings to implement a series of calculations in one quick stroke.
              </p>
              <button className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D47A1] hover:underline">Hide Help</button>
            </div>

            <div className="text-left">
              <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-white font-syne">Pay Groups Listing</h3>
            </div>

            {/* Grid of pay groups */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {payGroups.map((group) => (
                <div
                  key={group.id}
                  className={`p-6 rounded-[28px] border text-left flex flex-col justify-between group transition-all ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-white border-[#F4F3EF] hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-base text-[#1A1A2E] dark:text-white group-hover:text-[#0D47A1] transition-colors">{group.name}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        group.type === 'System' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20' 
                          : 'bg-purple-50 text-purple-650 border border-purple-100 dark:bg-purple-950/20'
                      }`}>
                        {group.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed min-h-[40px]">{group.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#F4F3EF] dark:border-slate-800/80 pt-4 mt-6 text-xs">
                    <span className="font-bold text-slate-400">{group.items} components configured</span>
                    <button className="text-[#0D47A1] dark:text-blue-400 font-bold hover:underline">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'Payroll Repository' && (
          <motion.div
            key="payroll-repository"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-[28px] border text-left relative transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-350' : 'bg-white border-[#F4F3EF] shadow-sm text-slate-500'}`}>
              <p className="text-xs font-semibold leading-relaxed">
                The <span className="font-bold text-[#1A1A2E] dark:text-white">Payroll Repository</span> stores templates, statutory rules, compliance instructions, and custom bulk bank upload formats. File and document revisions can be downloaded directly for external usage.
              </p>
            </div>

            {/* Document store listing */}
            <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="p-6 border-b border-[#F4F3EF] dark:border-slate-800 flex justify-between items-center">
                <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white font-syne">Repository Documents</h4>
                <button
                  onClick={() => toast.success('Statutory template uploaded successfully')}
                  className="flex items-center gap-2 px-4 py-2 border border-[#0D47A1] text-[#0D47A1] dark:text-blue-450 dark:border-blue-400 rounded-xl text-xs font-bold hover:bg-[#0D47A1]/5 transition-all"
                >
                  <FiUploadCloud size={14} /> Upload File
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/40">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Size</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repoFiles.map((file) => (
                      <tr key={file.id} className="border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all text-xs">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
                          <FiFileText className="text-blue-550 w-4 h-4 shrink-0" /> {file.name}
                        </td>
                        <td className="px-6 py-4 text-slate-550 font-semibold">{file.size}</td>
                        <td className="px-6 py-4 text-slate-550 font-semibold">{file.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toast.success(`Downloaded: ${file.name}`)}
                              className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center hover:scale-105 transition-all"
                              title="Download File"
                            >
                              <FiDownload size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setRepoFiles(prev => prev.filter(f => f.id !== file.id));
                                toast.success(`Removed: ${file.name}`);
                              }}
                              className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center hover:scale-105 transition-all"
                              title="Delete File"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'Payslip Gallery' && (
          <motion.div
            key="payslip-gallery"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-[28px] border text-left relative transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-350' : 'bg-white border-[#F4F3EF] shadow-sm text-slate-500'}`}>
              <p className="text-xs font-semibold leading-relaxed">
                Choose the default visual statement template from the <span className="font-bold text-[#1A1A2E] dark:text-white">Payslip Gallery</span>. The chosen layout will apply to all generated monthly payslips, digital PDF distributions, and self-service portals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {templates.map((tpl) => {
                const isSelected = selectedTemplate === tpl.name;
                return (
                  <div
                    key={tpl.name}
                    onClick={() => {
                      setSelectedTemplate(tpl.name);
                      toast.success(`Active Template: ${tpl.name}`);
                    }}
                    className={`rounded-[32px] border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#0D47A1] ring-2 ring-[#0D47A1]/20 shadow-lg scale-[1.02]' 
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:shadow-md'
                          : 'bg-white border-[#F4F3EF] hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className={`h-40 ${tpl.previewBg} flex flex-col justify-center items-center p-6 border-b border-[#F4F3EF] dark:border-slate-800 relative`}>
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                      
                      {/* Abstract preview visualization */}
                      <div className="w-full max-w-[140px] bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/50 shadow-sm space-y-1.5 animate-pulse">
                        <div className="w-10 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <div className="w-8 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="w-6 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                          </div>
                          <div className="space-y-1 flex flex-col items-end">
                            <div className="w-7 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="w-5 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-2.5">
                      <h4 className="font-bold text-base text-[#1A1A2E] dark:text-white">{tpl.name}</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{tpl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Dialog Portal */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateGroupModal(false)} className="fixed inset-0 bg-[#1A1A2E]/45 backdrop-blur-sm z-[1200]" />
            <div className="fixed inset-0 z-[1201] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
              >
                <div className="border-b border-[#F4F3EF] px-8 py-5 flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                  <h3 className="text-lg font-bold text-[#1A1A2E] font-syne">Create Pay Item Group</h3>
                  <button onClick={() => setShowCreateGroupModal(false)} className="w-9 h-9 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreateGroup} className="p-8 space-y-5 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Group Name *</label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Special Allowances Group"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Group Category</label>
                    <div className="flex gap-2 p-1 bg-[#F4F3EF] rounded-2xl h-[52px]">
                      {['Earnings', 'Deductions'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewGroupType(cat)}
                          className={`flex-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${newGroupType === cat ? 'bg-white text-[#0D47A1] shadow-sm' : 'text-[#9B9BAD] hover:text-[#6B6B7E]'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-3">
                    <button type="button" onClick={() => setShowCreateGroupModal(false)} className="flex-1 py-4 rounded-2xl border border-[#F4F3EF] text-xs font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] bg-[#0D47A1] text-white py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#0a3a82] transition-all">Create Group</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollSetupTab;
