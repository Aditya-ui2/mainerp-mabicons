import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiUserPlus, FiMoreVertical } from 'react-icons/fi';

const MeetingWithClientTab = () => {
  const upcomingMeetings = [
    { id: 1, title: 'Q1 Review & Renewal', client: 'TechNova Solutions', date: 'Oct 24, 2024', time: '10:00 AM', type: 'Virtual', platform: 'Zoom Meeting', attendees: 3 },
    { id: 2, title: 'Onboarding Follow-up', client: 'Global Retail Corp', date: 'Oct 25, 2024', time: '02:30 PM', type: 'In-Person', platform: 'Delhi HQ', attendees: 2 },
    { id: 3, title: 'Proposal Discussion', client: 'Evergreen Wellness', date: 'Oct 27, 2024', time: '11:00 AM', type: 'Virtual', platform: 'Google Meet', attendees: 4 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Client Meetings</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Schedule, manage, and track all interactions with your clients</p>
        </div>
        <div>
          <button className="px-6 py-3.5 bg-[#1B4DA0] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] transition-all">
             <FiCalendar size={18} /> Schedule Meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-[#1A1A2E] tracking-widest uppercase mb-4 text-left">Upcoming Schedule</h3>
          {upcomingMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-[#F4F3EF] hover:border-blue-100 hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 text-left">
               <div className="flex flex-col items-center justify-center min-w-[100px] py-4 bg-[#F8FAFF] rounded-2xl border border-blue-50">
                 <span className="text-[11px] font-black uppercase tracking-widest text-[#1B4DA0]">{meeting.date.split(',')[0]}</span>
                 <span className="text-xl font-black text-[#1A1A2E] mt-1">{meeting.time}</span>
               </div>
               <div className="flex-1 flex flex-col justify-center">
                 <h4 className="text-lg font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{meeting.title}</h4>
                 <p className="text-sm font-medium text-[#6B6B7E] mt-1">{meeting.client}</p>
                 <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">
                   <div className="flex items-center gap-1.5 bg-[#F4F3EF] px-3 py-1.5 rounded-lg">
                     {meeting.type === 'Virtual' ? <FiVideo size={12}/> : <FiMapPin size={12}/>}
                     {meeting.platform}
                   </div>
                   <div className="flex items-center gap-1.5 bg-[#F4F3EF] px-3 py-1.5 rounded-lg">
                     <FiUserPlus size={12}/>
                     {meeting.attendees} Attendees
                   </div>
                 </div>
               </div>
               <div className="flex items-start justify-end">
                 <button className="w-10 h-10 rounded-xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all">
                   <FiMoreVertical />
                 </button>
               </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
            <h3 className="text-sm font-black text-[#1A1A2E] tracking-widest uppercase mb-6 text-left">Calendar Overview</h3>
            <div className="h-64 bg-[#F8FAFF] rounded-2xl border border-[#F4F3EF] flex items-center justify-center flex-col gap-3">
               <FiCalendar size={40} className="text-[#1B4DA0] opacity-20" />
               <p className="text-[11px] font-bold text-[#9B9BAD] tracking-widest uppercase">Select Date to View details</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1B4DA0] to-indigo-600 rounded-[32px] p-8 shadow-lg text-white text-left relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-lg font-bold mb-2">Sync with Google Calendar</h4>
               <p className="text-sm font-medium text-blue-100 mb-6">Automatically track all invites and responses directly in your CRM.</p>
               <button className="w-full py-3.5 bg-white text-[#1B4DA0] rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm hover:scale-[1.02] transition-transform">
                 Connect Calendar
               </button>
             </div>
             <div className="absolute right-[-20%] bottom-[-20%] opacity-10">
                <FiCalendar size={180} />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default MeetingWithClientTab;
