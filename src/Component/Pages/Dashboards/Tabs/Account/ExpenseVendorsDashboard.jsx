import React, { useState } from 'react';
import {
  FiDollarSign,
  FiHome,
  FiWifi,
  FiTrendingUp,
  FiUsers,
  FiTruck,
  FiCreditCard,
  FiMonitor,
  FiPocket,
  FiClipboard,
  FiBell,
  FiMenu,
  FiPieChart,
  FiFileText,
  FiClock,
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

const ExpenseVendorsDashboard = () => {

  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('Expenses & Vendors');

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
              Expenses & Vendors
            </h1>

            <p className="text-[#9B9BAD] mt-3 text-lg">
              Track all company expenses and vendor payments
            </p>

          </div>

          <button className="w-14 h-14 rounded-2xl border border-[#E5E7EB] flex items-center justify-center bg-white">
            <FiBell size={22} />
          </button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">

          <StatCard
            title="Monthly Expenses"
            value="₹6,80,000"
            icon={FiDollarSign}
          />

          <StatCard
            title="Office Rent"
            value="₹1,20,000"
            icon={FiHome}
          />

          <StatCard
            title="Electricity & Internet"
            value="₹45,000"
            icon={FiWifi}
          />

          <StatCard
            title="Marketing Expenses"
            value="₹95,000"
            icon={FiTrendingUp}
          />

          <StatCard
            title="Recruitment Portal Costs"
            value="₹70,000"
            icon={FiUsers}
          />

          <StatCard
            title="Fuel & Travel"
            value="₹55,000"
            icon={FiTruck}
          />

          <StatCard
            title="Vendor Payments"
            value="₹2,40,000"
            icon={FiCreditCard}
          />

          <StatCard
            title="Software Subscriptions"
            value="₹38,000"
            icon={FiMonitor}
          />

          <StatCard
            title="Petty Cash"
            value="₹12,000"
            icon={FiPocket}
          />

          <StatCard
            title="Purchase Orders"
            value="186"
            icon={FiClipboard}
          />

        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* EXPENSE GRAPH */}

          <div className="xl:col-span-2 bg-white rounded-[40px] p-8 border border-[#ECECEC] shadow-sm">

            <div className="flex items-center justify-between mb-8">

              <h3 className="text-3xl font-black text-[#1A1A2E]">
                Expense Overview
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
                      label: 'Expenses',
                      data: [320000, 410000, 380000, 520000, 490000, 610000],
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

          {/* BREAKDOWN */}

          <div className="bg-white rounded-[40px] p-8 border border-[#ECECEC] shadow-sm">

            <h3 className="text-3xl font-black text-[#1A1A2E] mb-8">
              Expense Breakdown
            </h3>

            <div className="h-64">

              <Doughnut
                data={{
                  labels: [
                    'Office',
                    'Marketing',
                    'Vendor',
                    'Travel'
                  ],
                  datasets: [
                    {
                      data: [35, 25, 25, 15],
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

export default ExpenseVendorsDashboard;