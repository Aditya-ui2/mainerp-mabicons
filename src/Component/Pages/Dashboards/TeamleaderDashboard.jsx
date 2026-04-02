import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiMessageSquare,
  FiInbox,
  FiBriefcase,
  FiUserPlus,
  FiLogOut,
  FiSearch,
  FiBell,
  FiSettings,
  FiMail,
  FiFileText,
  FiChevronDown,
  FiPlus,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/images/mabicons logo blue.png";
import onboardingIllustration from "../../../assets/images/a-cheerful-professional-with-a-tidy-desk-and-an-op.svg";

import TeamTabs from "./Tabs/Teamtabs";
import TaskTab from "./Tabs/TaskTab";
import MessagesTab from "./Tabs/MessagesTab";
import RequestsTab from "./Tabs/RequestsTab";
import RecruitmentTab from "./Tabs/RecruitmentTab";

const sidebarItems = [
  { name: "Dashboard", icon: FiHome },
  { name: "Team", icon: FiUsers },
  { name: "Tasks", icon: FiCheckSquare },
  { name: "Messages", icon: FiMessageSquare },
  { name: "Requests", icon: FiInbox },
  { name: "Recruitment", icon: FiBriefcase },
  { name: "Onboarding", icon: FiUserPlus },
];

const OnboardingView = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-semibold text-slate-700">Candidate Onboarding</h1>
          <p className="mt-3 text-[26px] leading-none text-slate-500">Manage and track your candidate onboarding process</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 text-[25px] leading-none shadow-sm hover:opacity-95">
            <FiMail className="h-4 w-4" />
            Send Pre-Hiring Email
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-5 py-3 text-[25px] leading-none shadow-sm hover:opacity-95">
            <FiFileText className="h-4 w-4" />
            Generate Offer Letter
            <FiChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfdbea] bg-white/85 min-h-[620px] px-6 py-8 md:px-10 md:py-10 flex items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <img
            src={onboardingIllustration}
            alt="Onboarding"
            className="mx-auto w-full max-w-[380px]"
          />
          <h2 className="mt-6 text-[52px] leading-none font-medium text-slate-600">No candidates added yet</h2>
          <p className="mt-4 text-[35px] leading-none text-slate-400">Click the &apos;Add New Candidate&apos; button to get started</p>

          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 text-[36px] leading-none shadow hover:opacity-95">
            <FiPlus className="h-5 w-5" />
            Add New Candidate
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamleaderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Onboarding");

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "Team":
        return <TeamTabs isDarkMode={false} />;
      case "Tasks":
        return <TaskTab isDarkMode={false} />;
      case "Messages":
        return <MessagesTab isDarkMode={false} />;
      case "Requests":
        return <RequestsTab isDarkMode={false} />;
      case "Recruitment":
        return <RecruitmentTab isDarkMode={false} />;
      case "Dashboard":
      case "Onboarding":
      default:
        return <OnboardingView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f0fa] p-2 md:p-3">
      <div className="relative flex min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-[#dcd8ed] bg-[#f7f5fc]">
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#d9d2fb]/70 via-[#ebe7ff]/35 to-transparent" />
        <div className="absolute -bottom-10 left-10 h-44 w-96 rounded-full bg-[#e7e0ff]/60 blur-2xl" />
        <div className="absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full bg-[#d6d0ff]/50 blur-2xl" />

        <aside className="relative z-10 w-[250px] border-r border-[#e0dcec] bg-gradient-to-b from-[#f4f1fd] via-[#f2effb] to-[#ddd5fa]/45 p-5 flex flex-col">
          <div className="flex items-center h-16 border-b border-slate-200 bg-white -mx-5 -mt-5 px-4 mb-4">
            <img src={logo} alt="Mabicons" className="h-8 w-auto object-contain" />
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                  activeTab === item.name
                    ? "bg-[#ece5ff] text-slate-700"
                    : "text-slate-600 hover:bg-white/45"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[24px] leading-none font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-600 hover:bg-white/45"
          >
            <FiLogOut className="h-5 w-5" />
            <span className="text-[24px] leading-none font-medium">Logout</span>
          </button>
        </aside>

        <main className="relative z-10 flex-1 p-5 md:p-6">
          <div className="max-w-[1600px] mx-auto">
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
                <div className="relative">
                  <button className="rounded-full p-2 hover:bg-white/60">
                    <FiBell className="h-5 w-5" />
                  </button>
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <button className="rounded-full p-2 hover:bg-white/60">
                  <FiBell className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 hover:bg-white/60">
                  <FiSettings className="h-5 w-5" />
                </button>
                <div className="h-11 w-11 rounded-full bg-violet-400 text-white flex items-center justify-center font-bold text-sm">
                  RC
                </div>
              </div>
            </div>

            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamleaderDashboard;
