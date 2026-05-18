import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiChevronDown, FiChevronRight, FiX, FiUser, FiPhone, FiMail, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import { getShortlistedCandidates } from '../../../service/api';

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">{label}</p>
    <div className="bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 min-h-[44px] flex items-center">
      <span className="text-[13px] font-bold text-[#1A1A2E]">{value || 'N/A'}</span>
    </div>
  </div>
);

const CandidateDetailDrawer = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex justify-end font-jakarta pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md transition-opacity pointer-events-auto z-[200000]"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Profile</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                <span>{(candidate.candidate || 'C').substring(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <div className="space-y-1.5 w-full flex flex-col items-center">
              <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{candidate.candidate}</h4>
              <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{candidate.client}</p>
            </div>
          </div>

          <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                <FiUser className="text-[#1B4DA0]" size={18} />
                <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Candidate Identity</h5>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Full Name" value={candidate.candidate} />
                <InfoItem label="Department" value={candidate.department} />
                <InfoItem label="Role" value={candidate.position} />
                <InfoItem label="Company" value={candidate.client} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                <FiPhone className="text-[#1B4DA0]" size={18} />
                <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Contact Details</h5>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Phone Number" value={candidate.phone} />
                <InfoItem label="Email ID" value={candidate.email} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                <FiBriefcase className="text-[#1B4DA0]" size={18} />
                <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Professional Info</h5>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Experience" value={candidate.experience} />
                <InfoItem label="Current CTC" value={candidate.currentCTC} />
                <InfoItem label="Shortlisted Date" value={candidate.shortlistedDate} />
                <InfoItem label="Status" value={candidate.status} />
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const SuperAdminShortlistedCandidatesTab = ({ notificationBell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lifecycleData, setLifecycleData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await getShortlistedCandidates({});
      if (res && res.data) {
        const formattedData = res.data.map(item => ({
          id: item.id,
          candidate: item.name,
          client: item.client?.companyName || 'N/A',
          position: item.position?.title || 'N/A',
          department: item.position?.department || 'N/A',
          phone: item.phone,
          email: item.email,
          shortlistedDate: new Date(item.createdAt).toLocaleDateString(),
          status: item.status,
          source: item.source || 'ERP',
          experience: item.experience || 'N/A',
          currentCTC: item.currentSalary ? `${item.currentSalary} LPA` : 'N/A'
        }));
        setLifecycleData(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch shortlisted candidates", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = lifecycleData.filter(item => {
    const matchesSearch = (item.candidate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Shortlisted Candidates</h1>
        <div className="flex items-center gap-3">
          {notificationBell}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative group min-w-[180px]">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-12 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">ALL HIRES</option>
            <option value="this_week">THIS WEEK</option>
            <option value="this_month">THIS MONTH</option>
            <option value="custom">CUSTOM RANGE</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
            <div className="relative group">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#F4F3EF] border-none rounded-2xl py-3 px-4 text-[10px] font-bold uppercase outline-none transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
              />
              <span className="absolute -top-6 left-1 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">From</span>
            </div>
            <div className="w-2 h-[2px] bg-[#9B9BAD] rounded-full" />
            <div className="relative group">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#F4F3EF] border-none rounded-2xl py-3 px-4 text-[10px] font-bold uppercase outline-none transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
              />
              <span className="absolute -top-6 left-1 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">To</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Candidate</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Client & Joining</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">Loading candidates...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">No candidates found</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedCandidate(row)} className="hover:bg-[#F8FAFF] transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${row.source === 'SharePoint' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-[#0D47A1] border-blue-100'}`}>
                          {row.candidate?.charAt(0) || '?'}
                        </div>
                        <div className="text-left font-bold text-sm text-[#1A1A2E]">
                          {row.candidate}
                          {row.source === 'SharePoint' && (
                            <span className="ml-2 py-0.5 px-1.5 bg-emerald-100 text-emerald-700 text-[8px] rounded uppercase tracking-tighter">SP</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#4B4B5E]">{row.client}</p>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-blue-100 text-[#1B4DA0]">
                            {row.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Position: {row.position}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl"><FiChevronRight size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailDrawer
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminShortlistedCandidatesTab;
