import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-10 bg-white rounded-[40px] shadow-2xl border border-[#F4F3EF] text-center"
      >
        <div className="flex flex-col items-center">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[28px] flex items-center justify-center shadow-lg shadow-amber-500/5 mb-6"
          >
            <FiAlertTriangle size={36} />
          </motion.div>

          <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne uppercase">
            Reset Disabled
          </h2>
          <p className="mt-4 text-[#6B6B7E] text-sm leading-relaxed">
            Self-service password reset is disabled for security reasons. Users cannot change their password directly from here.
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#F4F3EF] text-left">
          <p className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest mb-1.5">Action Required</p>
          <p className="text-xs font-bold text-[#1A1A2E] leading-relaxed">
            Please contact the <span className="text-[#1B4DA0]">Tech Panel</span> or a <span className="text-[#1B4DA0]">Super Administrator</span> to request a manual password reset for your account.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#0D47A1] shadow-xl shadow-blue-500/15 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            <FiArrowLeft size={16} /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
