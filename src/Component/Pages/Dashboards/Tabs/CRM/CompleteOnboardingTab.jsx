import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSearch, FiCheckSquare, FiMapPin, FiActivity, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { getAllClients, editClient } from '../../../service/api';
import ClientOnboardingForm from './ClientOnboardingForm';
import { toast } from 'react-hot-toast';

const CompleteOnboardingTab = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [finalizingClient, setFinalizingClient] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllClients();
      console.log("Onboarding API Response:", res);
      if (res && res.success) {
        const raw = res.data?.clients || res.clients || res || [];
        const mapped = (Array.isArray(raw) ? raw : []).map(c => ({
          ...c,
          id: c.id || c._id,
          companyName: c.companyName || c.name || 'Unknown',
          spocName: c.spocName || c.contactPerson || c.name || 'N/A',
          location: c.corporateAddress || c.location || 'N/A'
        }));
        
        // Filter only clients in 'Finalize' stage or 'Requested' status
        const pending = mapped.filter(c => c.stage === 'Lead Stage' || c.status === 'Requested');
        console.log("Filtered Pending Clients:", pending);
        setClients(pending);
      }
    } catch (error) {
      toast.error("Failed to load pending onboarding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = clients.filter(c => 
    (c.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.spocName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left px-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight mb-1" style={{ fontFamily: '"Syne", sans-serif' }}>Pending Onboarding</h1>
          <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Complete profiles for clients added with basic details</p>
        </div>
        <button 
          onClick={fetchData}
          className="w-12 h-12 bg-white border border-[#F4F3EF] text-[#6B6B7E] rounded-2xl flex items-center justify-center hover:bg-[#F8FAFF] transition-all shadow-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-[#F4F3EF] overflow-hidden">
        <div className="px-10 py-8 border-b border-[#F4F3EF]">
          <div className="relative group max-w-md text-left">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#1B4DA0]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or SPOC..."
              className="w-full bg-[#F4F3EF]/50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/20 focus:bg-white transition-all placeholder:text-[#9B9BAD] placeholder:font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <div className="grid grid-cols-[250px_200px_180px_150px_1fr] gap-4 px-10 py-5 border-b border-[#F4F3EF] bg-[#FAFAFA]/50">
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left pl-[64px]">Company</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left">SPOC Details</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left">Location</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left">Status</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left pl-4">Action</div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <FiRefreshCw className="w-8 h-8 text-[#1B4DA0] animate-spin mx-auto mb-4" />
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Loading pending clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                <FiUsers size={32} />
              </div>
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">No pending onboardings found</p>
            </div>
          ) : filteredClients.map(c => (
            <div key={c.id} className="grid grid-cols-[250px_200px_180px_150px_1fr] gap-4 items-center px-10 py-8 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:scale-110 transition-transform shrink-0">
                  {c.companyName?.charAt(0)}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-[#1A1A2E] leading-tight">{c.companyName}</h4>
                  <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider">{c.industry || 'General'}</span>
                </div>
              </div>
              
              <div className="text-left space-y-1">
                <p className="text-sm font-bold text-[#1A1A2E]">{c.spocName}</p>
                <p className="text-[11px] text-[#9B9BAD] font-medium truncate">{c.spocEmail || c.email}</p>
              </div>

              <div className="text-left">
                <p className="text-xs font-bold text-[#6B6B7E] flex items-center gap-2">
                  <FiMapPin size={14} className="text-[#1B4DA0] shrink-0" /> 
                  <span className="truncate">{c.location || 'N/A'}</span>
                </p>
              </div>

              <div className="text-left">
                <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5 w-fit shadow-sm shadow-amber-500/5">
                  <FiActivity size={10} /> {c.status}
                </span>
              </div>

              <div className="flex justify-start pl-4">
                <button
                  onClick={() => {
                    setFinalizingClient(c);
                    setIsFinalizeOpen(true);
                  }}
                  className="px-6 py-3 bg-[#1B4DA0] text-white font-black text-[10px] uppercase tracking-[1px] rounded-xl hover:bg-[#153D80] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95 whitespace-nowrap"
                >
                  Complete <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ClientOnboardingForm
        isOpen={isFinalizeOpen}
        onClose={() => setIsFinalizeOpen(false)}
        mode="full"
        initialData={finalizingClient}
        onComplete={async (completeData) => {
          try {
            const payload = {
              ...completeData,
              clientId: finalizingClient.id,
              stage: 'Finalize',
              status: 'Accepted',
              probability: 100
            };
            
            const res = await editClient(payload);
            if (res.success) {
              toast.success("Client onboarding completed!");
              fetchData();
              setIsFinalizeOpen(false);
            }
          } catch (error) {
            toast.error(error.message || "Failed to complete onboarding");
          }
        }}
      />
    </motion.div>
  );
};

export default CompleteOnboardingTab;
