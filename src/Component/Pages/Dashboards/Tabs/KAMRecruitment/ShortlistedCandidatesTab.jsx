import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  Mail,
  Phone,
  ChevronDown,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllCandidates, getSharePointCandidates, getAllRecruitmentPositions, updateCandidateStatus } from '../../../service/api';

const ShortlistedCandidatesTab = ({ isDarkMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Action States
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch ERP candidates, SharePoint candidates, and job positions in parallel
      const [erpRes, spRes, positionsRes] = await Promise.all([
        getAllCandidates(),
        getSharePointCandidates().catch(e => ({ success: false, data: [] })),
        getAllRecruitmentPositions().catch(e => ({ success: false, data: [] }))
      ]);

      // 1. Process positions/clients for dropdowns first so we can map roleType to candidates
      let mappedPositions = [];
      if (positionsRes?.success && Array.isArray(positionsRes.data)) {
        mappedPositions = positionsRes.data.map(p => ({
          id: p.id || p._id,
          title: p.title,
          client: p.clientName || 'Unknown Client',
          clientId: p.clientId,
          roleType: p.roleType || ''
        }));
        setJobOpenings(mappedPositions);
      }

      // 2. Map ERP Candidates
      let erpMapped = [];
      if (erpRes?.success && erpRes.data) {
        const erpDataList = Array.isArray(erpRes.data) ? erpRes.data : [];
        erpMapped = erpDataList.map(c => {
          const matchedPos = mappedPositions.find(p => p.id === (c.position?.id || c.position?._id));
          return {
            id: c.id || c._id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            location: c.location || '',
            jobTitle: c.position?.title || '',
            client: c.client?.companyName || c.client?.name || '',
            stage: c.stage === 'Applied' ? 'Screening' : (c.stage || 'Screening'),
            rating: c.rating || 0,
            experience: c.experience || '',
            currentCTC: c.currentSalary || '',
            expectedCTC: c.expectedSalary || '',
            noticePeriod: c.noticePeriod || '30 days',
            skills: c.skills || [],
            appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
            lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
            pipelineStatus: c.pipelineStatus || 'pending',
            source: c.source || 'ERP',
            positionId: c.position?.id || c.position?._id,
            clientId: c.client?.id || c.client?._id,
            roleType: c.position?.roleType || matchedPos?.roleType || '',
            isSharePoint: false
          };
        });
      } else if (Array.isArray(erpRes)) {
        erpMapped = erpRes.map(c => {
          const matchedPos = mappedPositions.find(p => p.id === (c.position?.id || c.position?._id));
          return {
            id: c.id || c._id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            location: c.location || '',
            jobTitle: c.position?.title || '',
            client: c.client?.companyName || c.client?.name || '',
            stage: c.stage === 'Applied' ? 'Screening' : (c.stage || 'Screening'),
            rating: c.rating || 0,
            experience: c.experience || '',
            currentCTC: c.currentSalary || '',
            expectedCTC: c.expectedSalary || '',
            noticePeriod: c.noticePeriod || '30 days',
            skills: c.skills || [],
            appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
            lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
            pipelineStatus: c.pipelineStatus || 'pending',
            source: c.source || 'ERP',
            positionId: c.position?.id || c.position?._id,
            clientId: c.client?.id || c.client?._id,
            roleType: c.position?.roleType || matchedPos?.roleType || '',
            isSharePoint: false
          };
        });
      }

      // 3. Map SharePoint Candidates
      let spMapped = [];
      if (spRes?.success && spRes.data) {
        const spDataList = Array.isArray(spRes.data) ? spRes.data : [];
        spMapped = spDataList.map(c => {
          const matchedPos = mappedPositions.find(p => p.title?.toLowerCase() === c.jobTitle?.toLowerCase());
          return {
            id: `sp-${c.id}`,
            sharePointId: c.id,
            name: c.candidateName || 'Unknown',
            email: c.email || '',
            phone: c.phone || '',
            location: c.location || '',
            jobTitle: c.jobTitle || '',
            client: c.clientName || 'SharePoint',
            stage: c.stage || 'Screening',
            rating: 0,
            experience: c.experience || '',
            appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
            lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
            source: 'SharePoint',
            isSharePoint: true,
            pipelineStatus: 'pending',
            roleType: matchedPos?.roleType || '',
            skills: []
          };
        });
      }

      // Combine and filter to only include Shortlisted candidates
      const combined = [...erpMapped, ...spMapped];
      const shortlisted = combined.filter(c => c.stage === 'Shortlisted');
      setCandidates(shortlisted);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (candidateId, newStage, candidateName) => {
    try {
      setUpdatingId(candidateId);
      const res = await updateCandidateStatus(candidateId, { stage: newStage });
      if (res?.success || res) {
        toast.success(`Candidate ${candidateName} moved to ${newStage}`);
        setCandidates(prev => prev.filter(c => c.id !== candidateId && c._id !== candidateId));
      } else {
        toast.error('Failed to update stage');
      }
    } catch (err) {
      console.error('Error changing stage:', err);
      toast.error(err.message || 'Failed to update candidate stage');
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract client, position, and role options from openings for standard filter bar UI
  const clientList = Array.from(new Set(jobOpenings.map(j => j.client).filter(Boolean)));
  const roleList = Array.from(new Set(jobOpenings.map(j => j.roleType).filter(Boolean)));
  const positionList = jobOpenings;

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.client || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClient = selectedClient === 'all' || 
      candidate.client === selectedClient || 
      candidate.clientId === selectedClient ||
      (candidate.client || '').toLowerCase().trim() === selectedClient.toLowerCase().trim();

    const matchesPosition = selectedPosition === 'all' || 
      candidate.positionId === selectedPosition || 
      candidate.jobTitle === selectedPosition ||
      String(candidate.positionId) === String(selectedPosition) ||
      (candidate.jobTitle || '').toLowerCase() === selectedPosition.toLowerCase();

    const matchesRole = selectedRole === 'all' || 
      (candidate.roleType || '').toLowerCase().trim() === selectedRole.toLowerCase().trim();

    return matchesSearch && matchesClient && matchesPosition && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-2 pb-8 px-4 font-sans">
      {/* 1. Header Section */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="text-left space-y-1">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
            Shortlisted Candidates
          </h1>
          <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-wider">
              
          </p>
        </div>
      </div>

      {/* 2. Filter Bar Unification (Standardized UI matching Offer Management) */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, email, phone, client, role..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Client Filter */}
        <div className="relative">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="all">All Clients</option>
            {clientList.map(client => (
              <option key={client} value={client}>{client.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none opacity-50" size={14} />
        </div>

        {/* Position Filter */}
        <div className="relative">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="all">All Openings</option>
            {positionList.map(job => (
              <option key={job.id} value={job.id}>{job.title.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none opacity-50" size={14} />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="all">All Roles</option>
            {roleList.map(role => (
              <option key={role} value={role}>{role.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none opacity-50" size={14} />
        </div>
      </div>

      {/* 3. Table / Content Section */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-[#1B4DA0] rounded-full animate-spin" />
            <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-wider">Fetching Shortlisted Candidates...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-[#9B9BAD] mx-auto border border-[#F4F3EF]">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">No Candidates Found</h3>
              <p className="text-sm text-[#9B9BAD] mt-1">There are no shortlisted candidates matching your current filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4F3EF]">
                  <th className="px-8 py-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Candidate Info</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Target Role & Client</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Exp / CTC</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Contact Details</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredCandidates.map((candidate, idx) => {
                  const candidateId = candidate.id || candidate._id;
                  return (
                    <motion.tr
                      key={candidateId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-[#F8FAFF] transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#1B4DA0] flex items-center justify-center font-black text-sm uppercase">
                            {candidate.name?.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-[#1A1A2E]">{candidate.name}</p>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">
                              Shortlisted
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-left">
                        <p className="text-sm font-bold text-[#1A1A2E]">{candidate.jobTitle || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                          {candidate.client || 'N/A'}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-left">
                        <p className="text-sm font-bold text-[#1A1A2E]">{candidate.experience || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">
                          CTC: {candidate.currentCTC || 'N/A'}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-left">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#1A1A2E] flex items-center gap-2">
                            <Mail size={12} className="text-[#9B9BAD]" /> {candidate.email || 'N/A'}
                          </p>
                          <p className="text-xs font-bold text-[#6B6B7E] flex items-center gap-2">
                            <Phone size={12} className="text-[#9B9BAD]" /> {candidate.phone || 'N/A'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Shortlisted
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStageChange(candidateId, 'Offer Sent', candidate.name)}
                            disabled={updatingId === candidateId}
                            className="px-4 py-2 rounded-xl bg-blue-50 text-[#1B4DA0] hover:bg-blue-100 font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                            title="Generate Offer Letter"
                          >
                            Send Offer
                          </button>
                          <button
                            onClick={() => handleStageChange(candidateId, 'Rejected', candidate.name)}
                            disabled={updatingId === candidateId}
                            className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all disabled:opacity-50"
                            title="Reject Candidate"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistedCandidatesTab;
