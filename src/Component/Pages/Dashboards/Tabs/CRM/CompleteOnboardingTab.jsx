import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSearch, FiCheckSquare, FiMapPin, FiActivity, FiRefreshCw, FiArrowRight, FiDatabase, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { getAllClients, editClient } from '../../../service/api';
import ClientOnboardingForm from './ClientOnboardingForm';
import { toast } from 'react-hot-toast';

const CompleteOnboardingTab = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState({
    filterType: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
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

  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.spocName || '').toLowerCase().includes(search.toLowerCase());
    
    if (dateFilter.filterType === 'all') return matchesSearch;

    const joinedDate = new Date(c.createdAt || c.date || Date.now());
    
    if (dateFilter.filterType === 'last7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && joinedDate >= sevenDaysAgo;
    }

    if (dateFilter.filterType === 'date' && dateFilter.date) {
      return matchesSearch && joinedDate.toISOString().split('T')[0] === dateFilter.date;
    }

    if (dateFilter.filterType === 'range') {
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      return matchesSearch && joinedDate >= start && joinedDate <= end;
    }

    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 animate-in fade-in duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div className="flex flex-col gap-1 text-left">


          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Client Onboarding
          </h1>

        </div>
      </div>

      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or SPOC..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD] placeholder:font-bold"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="px-6 py-4 bg-[#F4F3EF] text-[#1A1A2E] rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E8E7E2] transition-all"
          >
            <FiActivity size={18} className="text-[#1B4DA0]" />
            <span className="whitespace-nowrap">
              {dateFilter.filterType === 'all' ? 'All Time' : 
               dateFilter.filterType === 'range' ? 'Custom Range' : 
               dateFilter.filterType.charAt(0).toUpperCase() + dateFilter.filterType.slice(1)}
            </span>
            <FiChevronDown className={`transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDateFilter && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#F4F3EF] z-50 overflow-hidden text-left"
              >
                <div className="p-6 border-b border-[#F4F3EF] bg-[#FAFAFA]">
                  <p className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Select Time Period</p>
                </div>

                <div className="flex border-b border-[#F4F3EF] bg-[#FDFDFD]">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'last7days', label: '7 Days' },
                    { key: 'date', label: 'Date' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setDateFilter({ ...dateFilter, filterType: tab.key })}
                      className={`flex-1 px-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${dateFilter.filterType === tab.key
                        ? 'text-[#1B4DA0] bg-white border-b-2 border-[#1B4DA0]'
                        : 'text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-[#F4F3EF]'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-6">
                  {dateFilter.filterType === 'all' && (
                    <div className="py-4 text-center">
                      <p className="text-xs font-bold text-[#6B6B7E]">Showing all available data.</p>
                    </div>
                  )}

                  {dateFilter.filterType === 'last7days' && (
                    <div className="py-4 text-center">
                      <p className="text-xs font-bold text-[#6B6B7E]">Showing data from last 7 days.</p>
                    </div>
                  )}

                  {dateFilter.filterType === 'date' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Select Date</label>
                        <input
                          type="date"
                          value={dateFilter.date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDateFilter({ ...dateFilter, date: e.target.value })}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => setDateFilter({...dateFilter, date: new Date().toISOString().split('T')[0], filterType: 'date'})} className="flex-1 px-3 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-[9px] font-black uppercase hover:bg-blue-50 transition-all">Today</button>
                        <button onClick={() => setDateFilter({...dateFilter, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], filterType: 'date'})} className="flex-1 px-3 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-[9px] font-black uppercase hover:bg-blue-50 transition-all">Yesterday</button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="w-full py-4 bg-[#1B4DA0] text-white rounded-[20px] text-xs font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:bg-[#0D47A1] transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_120px] gap-4 px-10 py-5 border-b border-[#F4F3EF] bg-gray-50/50">
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left pl-[64px]">Company</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">SPOC Details</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Location</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Joined</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Status</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left pl-4">Action</div>
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
            <div key={c.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_120px] gap-4 items-center px-10 py-8 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] transition-all group">
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
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1A1A2E]">{new Date(c.createdAt || c.date || Date.now()).toLocaleDateString()}</span>
                  <span className="text-[10px] text-[#9B9BAD] font-medium">{new Date(c.createdAt || c.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
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
