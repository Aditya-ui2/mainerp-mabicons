import { useState } from 'react';
import {
  FiSearch,
  FiBell,
  FiSettings,
} from 'react-icons/fi';
import logo from '../../../assets/images/ERP LOGO.png';

const moduleItems = [
  { id: 1, title: 'Attendance & Time Tracking' },
  { id: 2, title: 'Payroll' },
  { id: 3, title: 'Onboarding' },
  { id: 4, title: 'Policy Making' },
  { id: 5, title: 'Master Data (Emp)' },
  { id: 6, title: 'Performance Management' },
  { id: 7, title: 'Offboarding' },
  { id: 8, title: 'FnF' },
  { id: 9, title: 'Document Verify' },
  { id: 10, title: 'Notes' },
  { id: 11, title: 'Employee Engagement' },
  { id: 12, title: 'Task by Client' },
  { id: 13, title: 'Leave Management' },
  { id: 14, title: 'Compliance Management' },
];

const KamDashboard = () => {
  const [activeTab, setActiveTab] = useState(moduleItems[0].title);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f2f0fa] p-2 md:p-3">
      <div className="relative flex min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-[#dcd8ed] bg-[#f7f5fc]">
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#d9d2fb]/70 via-[#ebe7ff]/35 to-transparent" />
        <div className="absolute -bottom-10 left-10 h-44 w-96 rounded-full bg-[#e7e0ff]/60 blur-2xl" />
        <div className="absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full bg-[#d6d0ff]/50 blur-2xl" />

        {/* Sidebar */}
        <aside className="relative z-10 w-[280px] border-r border-[#e0dcec] bg-gradient-to-b from-[#f4f1fd] via-[#f2effb] to-[#ddd5fa]/45 p-5 flex flex-col">
          <div className="flex items-center gap-3 pb-5 pt-1 px-1">
            <img src={logo}  className="h-8 w-8 object-contain" />
           
          </div>

          <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
            {moduleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.title)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition ${
                  activeTab === item.title
                    ? 'bg-[#ece5ff] text-slate-700'
                    : 'text-slate-600 hover:bg-white/45'
                }`}
              >
                <span className="text-base leading-none font-medium truncate">{item.title}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-5 w-[155px] rounded-full bg-[#f13737] hover:bg-[#e53131] text-white py-3 text-[20px] leading-none font-medium"
          >
            Logout
          </button>
        </aside>

        {/* Main */}
        <main className="relative z-10 flex-1 p-5 md:p-6">
          <div className="max-w-[1600px] mx-auto">
            {/* Top bar */}
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#e8e4f3] pb-4">
              <div className="relative flex-1 max-w-3xl">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-xl border border-[#e4dfef] bg-[#f2eff8] py-3 pl-10 pr-4 text-base leading-none text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center gap-2 md:gap-3 text-slate-600">
                <button className="rounded-full p-2 hover:bg-white/60">
                  <FiBell className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 hover:bg-white/60">
                  <FiBell className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 hover:bg-white/60">
                  <FiSettings className="h-5 w-5" />
                </button>
                <div className="h-11 w-11 rounded-full bg-violet-400 text-white flex items-center justify-center font-bold text-sm">
                  K
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="rounded-2xl border border-[#dfdbea] bg-white/85 min-h-[520px] p-8 flex items-center justify-center">
              <p className="text-xl text-slate-500 font-medium">{activeTab}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KamDashboard;
