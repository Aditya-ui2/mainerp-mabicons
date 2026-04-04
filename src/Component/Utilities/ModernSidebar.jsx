import React, { useState } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'react-feather';
import { useNavigate } from 'react-router-dom';

const ModernSidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Layout, path: '/admin-dashboard' },
    { id: 'recruitment', label: 'Recruitment', icon: Icons.Users, path: '/recruitment-head-dashboard' },
    { id: 'candidates', label: 'Candidates', icon: Icons.Briefcase, path: '/candidate-management' },
    { id: 'interviews', label: 'Interviews', icon: Icons.Calendar, path: '/interview-schedule' },
    { id: 'tasks', label: 'Tasks', icon: Icons.CheckSquare, path: '/tasks' },
    { id: 'analytics', label: 'Analytics', icon: Icons.TrendingUp, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Icons.Settings, path: '/settings' },
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
    setMobileOpen(false);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <motion.aside
      className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${
        !isMobile && collapsed ? 'w-16' : 'w-56'
      }`}
      style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}
    >
      {/* Logo + Toggle */}
      <div
        className={`h-16 flex items-center border-b border-gray-200 flex-shrink-0 transition-all ${
          !isMobile && collapsed ? 'justify-center px-0' : 'px-4 justify-between'
        }`}
      >
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5">
            <div className="text-2xl font-bold text-blue-600">M</div>
            <span className="text-sm font-semibold text-gray-900">abicons</span>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          return (
            <motion.button
              key={id}
              onClick={() => handleNavClick({ path: NAV_ITEMS.find(i => i.id === id)?.path, id })}
              whileHover={{ x: collapsed ? 0 : 4 }}
              className={`w-[calc(100%-12px)] flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-xl transition-all duration-150 text-left mb-0.5 ${
                !isMobile && collapsed ? 'justify-center' : ''
              } text-gray-600 hover:text-blue-600 hover:bg-blue-50`}
            >
              <Icon size={17} className="flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-200 p-3 ${!isMobile && collapsed ? 'text-center' : ''}`}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {!collapsed || isMobile ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-bold">
                S
              </div>
              <div>
                <p className="font-medium text-gray-900">Sachin</p>
                <p className="text-gray-500">Recruitment Head</p>
              </div>
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-bold">
              S
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent isMobile={false} />
      </div>
      
      {/* Spacing for desktop */}
      <div className={`hidden md:block transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`} />

      {/* Mobile Hamburger Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="md:hidden fixed top-4 left-4 z-[60] w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-all"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </motion.button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-[60] flex"
            >
              <SidebarContent isMobile={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModernSidebar;
