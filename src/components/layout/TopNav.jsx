import { Bell, ChevronDown, User, Settings, LogOut, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_TITLES = {
  dashboard: "Dashboard Overview",
  "team-overview": "Team Members",
  "kam-performance": "KAM Performance",
  "task-assignment": "Task Assignment",
  jobs: "Job Openings",
  candidates: "Candidate Pipeline",
  interviews: "Interview Schedule",
  offers: "Offer Management",
  "resume-bank": "Resume Bank",
  "activity-feed": "Activity Feed",
};

export default function TopNav({ activePage, userName = "HR Admin", userInitials = "HR", onLogout = () => {} }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    onLogout();
  };

  const notifications = [
    { msg: "New application for Senior Frontend", time: "2h ago", dot: "bg-blue-500" },
    { msg: "Interview with candidate in 30 min", time: "4h ago", dot: "bg-amber-400" },
    { msg: "Offer accepted by Morgan Lee", time: "5h ago", dot: "bg-green-400" },
  ];

  return (
    <header
      className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-[#E8E7E2] dark:border-gray-800 flex items-center px-6 sticky top-0 z-40"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-[#1A1A2E] dark:text-white tracking-tight">
          {PAGE_TITLES[activePage] || "Dashboard"}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search - Subtle for minimalism */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F4F3EF] dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-[#1B4DA0]/20 transition-all">
          <Search size={14} className="text-[#9B9BAD]" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-0 outline-none text-xs text-[#1A1A2E] dark:text-white w-32 focus:w-48 transition-all placeholder-[#9B9BAD]"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUserMenuOpen(false);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B7E] dark:text-gray-400 hover:text-[#1B4DA0] dark:hover:text-blue-400 hover:bg-[#EEF2FB] dark:hover:bg-gray-800 transition-all relative"
          >
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#1B4DA0] dark:bg-blue-400 rounded-full border border-white dark:border-gray-900" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-800 rounded-2xl border border-[#E8E7E2] dark:border-gray-700 py-2 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                <div className="px-4 py-3 border-b border-[#F4F3EF] dark:border-gray-700 bg-[#FAFAFA] dark:bg-gray-900/50">
                  <p className="text-xs font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest">Notifications</p>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-[#F4F3EF] dark:divide-gray-700">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="px-4 py-3.5 hover:bg-[#F8FAFF] dark:hover:bg-gray-700/50 cursor-pointer flex items-start gap-4 transition-colors"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-[13px] text-[#1A1A2E] dark:text-white font-semibold leading-snug">{n.msg}</p>
                        <p className="text-[10px] text-[#9B9BAD] dark:text-gray-400 mt-1 font-bold uppercase tracking-wider">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 text-[10px] font-bold text-[#1B4DA0] dark:text-blue-400 hover:bg-[#F8FAFF] dark:hover:bg-gray-700 uppercase tracking-widest border-t border-[#F4F3EF] dark:border-gray-700 transition-colors">
                  View All
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 pl-3 border-l border-[#E8E7E2] dark:border-gray-700 cursor-pointer group rounded-xl py-1 transition-all"
          >
            <div className={`w-8 h-8 rounded-lg bg-[#1B4DA0] dark:bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20`}>
              <span className="text-[11px] font-bold text-white uppercase">{userInitials}</span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#1A1A2E] dark:text-white leading-none whitespace-nowrap">{userName}</span>
              <span className="text-[9px] font-bold text-[#9B9BAD] dark:text-gray-500 uppercase tracking-wider leading-none mt-1">Admin</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-[#9B9BAD] transition-transform duration-200 ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-2xl border border-[#E8E7E2] dark:border-gray-700 py-2 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                {[
                  { label: "My Profile", icon: User, onClick: () => console.log("Profile") },
                  { label: "Settings", icon: Settings, onClick: () => console.log("Settings") },
                  { label: "Sign Out", icon: LogOut, danger: true, onClick: handleLogout },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      item.onClick();
                      setUserMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                      item.danger
                        ? "text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        : "text-[#1A1A2E] dark:text-white hover:bg-[#F8FAFF] dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="text-[13px] font-bold">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
