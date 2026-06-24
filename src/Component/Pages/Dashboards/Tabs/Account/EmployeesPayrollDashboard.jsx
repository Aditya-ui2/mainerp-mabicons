import React, { useState } from 'react';
import {
  FiUsers,
  FiDollarSign,
  FiClock,
  FiFileText,
  FiGift,
  FiAward,
  FiCreditCard,
  FiTrendingUp,
  FiBriefcase,
  FiBell,
  FiMenu,
  FiPieChart,
  FiClipboard,
  FiTruck,
  FiSettings,
  FiLogOut,
  FiBarChart2
} from 'react-icons/fi';

import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: FiPieChart
  },
  {
    title: 'Clients',
    icon: FiUsers
  },
  {
    title: 'Employees & Payroll',
    icon: FiClipboard
  },
  {
    title: 'Billing & Invoices',
    icon: FiFileText
  },
  {
    title: 'Expenses & Vendors',
    icon: FiTruck
  },
  {
    title: 'Collections',
    icon: FiCreditCard
  },
  {
    title: 'Pending Payments',
    icon: FiClock
  },
  {
    title: 'Settings',
    icon: FiSettings
  }
];

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-[32px] p-6 border border-[#ECECEC] shadow-sm hover:shadow-xl transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-5">
        <Icon size={24} className="text-[#1B4DA0]" />
      </div>

      <p className="text-[11px] uppercase tracking-[3px] text-[#9B9BAD] font-black">
        {title}
      </p>

      <h2 className="text-[36px] font-black text-[#1A1A2E] mt-3">
        {value}
      </h2>
    </motion.div>
  );
};

const EmployeesPayrollDashboard = () => {

  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('Employees & Payroll');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* SIDEBAR */}

      <motion.div
        animate={{
          width: collapsed ? 90 : 270
        }}
        transition={{
          duration: 0.3
        }}
        className="h-screen bg-white border-r border-[#ECECEC] flex flex-col justify-between sticky top-0 shrink-0"
      >

        {/* TOP */}

        <div>

          {/* LOGO */}

          <div className={`flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          } px-5 py-6 border-b border-[#F4F4F4]`}>

            {!collapsed && (
              <div>

                <h1 className="text-[38px] font-black leading-none text-[#1A1A2E]">
                  mabicons
                </h1>

                <p className="text-[10px] tracking-[3px] uppercase text-[#9B9BAD] mt-1">
                  Accounts ERP
                </p>

              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-11 h-11 rounded-2xl bg-[#F4F7FE] flex items-center justify-center hover:bg-[#E9EEFF] transition-all"
            >
              <FiMenu size={20} />
            </button>

          </div>

          {/* MENU */}

          <div className="p-4 space-y-2">

            {sidebarItems.map((item, index) => {

              const Icon = item.icon;

              return (
                <button
                  key={index}
                  onClick={() => setActive(item.title)}
                  className={`w-full flex items-center ${
                    collapsed
                      ? 'justify-center'
                      : 'gap-4 px-4'
                  } py-4 rounded-2xl transition-all duration-300
                  ${
                    active === item.title
                      ? 'bg-[#1B4DA0] text-white shadow-lg'
                      : 'hover:bg-[#F4F7FE] text-[#1A1A2E]'
                  }`}
                >

                  <Icon
                    size={22}
                    className={`transition-all ${
                      active === item.title
                        ? 'scale-110'
                        : ''
                    }`}
                  />

                  {!collapsed && (
                    <span className="font-semibold text-sm">
                      {item.title}
                    </span>
                  )}

                </button>
              );
            })}

          </div>

        </div>

        {/* LOGOUT */}

        <div className="p-4 border-t border-[#F4F4F4]">

          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-red-50 text-red-500 transition-all">

            <FiLogOut size={22} />

            {!collapsed && (
              <span className="font-semibold text-sm">
                Logout
              </span>
            )}

          </button>

        </div>

      </motion.div>

      {/* MAIN */}

      <div className="flex-1 p-8 overflow-y-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10 bg-white border border-[#ECECEC] rounded-[32px] p-7 shadow-sm">

          <div>

            <h1 className="text-5xl font-black text-[#1A1A2E]">
              Employees & Payroll
            </h1>

            <p className="text-[#9B9BAD] mt-3 text-lg">
              Employee salary and payout management
            </p>

          </div>

          <button className="w-14 h-14 rounded-2xl border border-[#E5E7EB] flex items-center justify-center bg-white">
            <FiBell size={22} />
          </button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">

          <StatCard
            title="All Employees"
            value="248"
            icon={FiUsers}
          />

          <StatCard
            title="Salary Structure"
            value="₹18,50,000"
            icon={FiDollarSign}
          />

          <StatCard
            title="Monthly Payroll"
            value="₹12,80,000"
            icon={FiClipboard}
          />

          <StatCard
            title="Incentives"
            value="₹2,40,000"
            icon={FiTrendingUp}
          />

          <StatCard
            title="Bonuses"
            value="₹1,20,000"
            icon={FiGift}
          />

          <StatCard
            title="Reimbursements"
            value="₹80,000"
            icon={FiCreditCard}
          />

          <StatCard
            title="PF / ESI / TDS"
            value="₹3,10,000"
            icon={FiFileText}
          />

          <StatCard
            title="Salary Slips"
            value="248"
            icon={FiAward}
          />

          <StatCard
            title="Payroll Status"
            value="92%"
            icon={FiBarChart2}
          />

          <StatCard
            title="Employee Costing"
            value="₹24,00,000"
            icon={FiBriefcase}
          />

        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* PAYROLL GRAPH */}

          <div className="xl:col-span-2 bg-white rounded-[40px] p-8 border border-[#ECECEC] shadow-sm">

            <div className="flex items-center justify-between mb-8">

              <h3 className="text-3xl font-black text-[#1A1A2E]">
                Payroll Graph
              </h3>

              <select className="border border-gray-200 rounded-xl px-4 py-2">
                <option>This Year</option>
              </select>

            </div>

            <div className="h-80">

              <Bar
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Payroll',
                      data: [180000, 210000, 240000, 220000, 260000, 300000],
                      backgroundColor: '#1B4DA0',
                      borderRadius: 10
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />

            </div>

          </div>

          {/* PAYOUT BREAKDOWN */}

          <div className="bg-white rounded-[40px] p-8 border border-[#ECECEC] shadow-sm">

            <h3 className="text-3xl font-black text-[#1A1A2E] mb-8">
              Payout Breakdown
            </h3>

            <div className="h-64">

              <Doughnut
                data={{
                  labels: [
                    'Salary',
                    'Bonus',
                    'PF',
                    'Incentives'
                  ],
                  datasets: [
                    {
                      data: [45, 20, 15, 20],
                      backgroundColor: [
                        '#1B4DA0',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444'
                      ],
                      borderWidth: 0
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false
                }}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeesPayrollDashboard;