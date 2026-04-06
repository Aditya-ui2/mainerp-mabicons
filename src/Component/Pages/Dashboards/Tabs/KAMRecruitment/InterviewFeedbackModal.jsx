import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiUser,
  FiStar,
  FiBriefcase,
  FiCheck,
  FiAlertCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiMinus,
} from 'react-icons/fi';
import { submitInterviewFeedback, getInterviewFeedbackForm } from '../../../service/api';

/* ── Rating Slider Component ── */
const RatingSlider = ({ label, description, value, onChange, icon: Icon, color, isDarkMode }) => {
  const getColor = (val) => {
    if (val <= 3) return '#ef4444';
    if (val <= 5) return '#f59e0b';
    if (val <= 7) return '#3b82f6';
    return '#10b981';
  };

  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {label}
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {description}
            </p>
          </div>
        </div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
          style={{ backgroundColor: getColor(value) }}
        >
          {value}
        </div>
      </div>
      <div className="mt-3">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${getColor(value)} ${(value - 1) * 11.11}%, ${isDarkMode ? '#334155' : '#e2e8f0'} ${(value - 1) * 11.11}%)`
          }}
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Poor (1)</span>
          <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Excellent (10)</span>
        </div>
      </div>
    </div>
  );
};

/* ── Recommendation Button ── */
const RecommendationButton = ({ value, selected, onClick, isDarkMode }) => {
  const config = {
    'Strongly Recommend': { icon: FiThumbsUp, color: '#10b981', label: 'Strongly Recommend' },
    'Recommend': { icon: FiThumbsUp, color: '#3b82f6', label: 'Recommend' },
    'Neutral': { icon: FiMinus, color: '#f59e0b', label: 'Neutral' },
    'Not Recommend': { icon: FiThumbsDown, color: '#f97316', label: 'Not Recommend' },
    'Strongly Not Recommend': { icon: FiThumbsDown, color: '#ef4444', label: 'Strongly Not Recommend' },
  };

  const { icon: Icon, color, label } = config[value];

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(value)}
      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
        selected
          ? 'border-current shadow-lg'
          : isDarkMode
            ? 'border-slate-600 hover:border-slate-500'
            : 'border-slate-200 hover:border-slate-300'
      }`}
      style={selected ? { borderColor: color, backgroundColor: `${color}10` } : {}}
    >
      <Icon className="w-5 h-5" style={{ color: selected ? color : isDarkMode ? '#94a3b8' : '#64748b' }} />
      <span 
        className={`text-xs font-medium text-center ${selected ? '' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
        style={selected ? { color } : {}}
      >
        {label}
      </span>
    </motion.button>
  );
};

/* ══════════════════════════════════════════════════════ */
const InterviewFeedbackModal = ({ 
  isOpen, 
  onClose, 
  interview, 
  isDarkMode, 
  onFeedbackSubmitted 
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [feedback, setFeedback] = useState({
    skills: 5,
    attitude: 5,
    knowledge: 5,
    communication: 5,
    behavior: 5,
    strengths: '',
    weaknesses: '',
    recommendation: '',
    notes: '',
  });

  const evaluationCriteria = [
    { key: 'skills', label: 'Technical Skills', description: 'Technical expertise and proficiency', icon: FiBriefcase, color: '#8b5cf6' },
    { key: 'attitude', label: 'Attitude', description: 'Enthusiasm and positive mindset', icon: FiThumbsUp, color: '#10b981' },
    { key: 'knowledge', label: 'Domain Knowledge', description: 'Industry and domain expertise', icon: FiStar, color: '#f59e0b' },
    { key: 'communication', label: 'Communication', description: 'Clarity and articulation', icon: FiUser, color: '#3b82f6' },
    { key: 'behavior', label: 'Professional Behavior', description: 'Professionalism and conduct', icon: FiCheck, color: '#ec4899' },
  ];

  const calculateOverall = () => {
    const total = feedback.skills + feedback.attitude + feedback.knowledge + feedback.communication + feedback.behavior;
    return Math.round(total / 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.recommendation) {
      setError('Please select a recommendation');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitInterviewFeedback(interview._id || interview.id, {
        ...feedback,
        overallRating: calculateOverall(),
      });
      
      setSuccess(true);
      setTimeout(() => {
        onFeedbackSubmitted && onFeedbackSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300" onClick={onClose}>
        <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
            <div>
              <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Interview Feedback</h3>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                {interview?.candidate?.name || interview?.candidateName} • {interview?.position?.title || interview?.position}
              </p>
            </div>
            <button onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
              <FiX size={20} />
            </button>
          </div>

          {/* Success State */}
          {success && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheck className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1A1A2E]">Feedback Submitted!</h3>
              <p className="text-[#9B9BAD]">Thank you for your evaluation</p>
            </motion.div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-8">
              {/* Error Alert */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-100 text-red-700">
                  <FiAlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {/* Overall Score */}
              <div className="md:col-span-2">
                <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-4">
                  <FiStar size={14} /> Overall Rating
                </h4>
                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#F4F3EF]">
                  <p className="text-sm font-bold text-[#9B9BAD]">Auto-calculated based on criteria</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
                      style={{ background: calculateOverall() <= 3 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : calculateOverall() <= 5 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : calculateOverall() <= 7 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
                      {calculateOverall()}
                    </div>
                    <span className="text-sm font-medium text-[#9B9BAD]">/ 10</span>
                  </div>
                </div>
              </div>

              {/* Rating Criteria */}
              <div>
                <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-4">
                  <FiBriefcase size={14} /> Evaluation Criteria
                </h4>
                <div className="space-y-4">
                  {evaluationCriteria.map((criteria) => (
                    <RatingSlider
                      key={criteria.key}
                      label={criteria.label}
                      description={criteria.description}
                      value={feedback[criteria.key]}
                      onChange={(val) => setFeedback(prev => ({ ...prev, [criteria.key]: val }))}
                      icon={criteria.icon}
                      color={criteria.color}
                      isDarkMode={false}
                    />
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-4">
                  <FiThumbsUp size={14} /> Recommendation *
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend', 'Strongly Not Recommend'].map((rec) => (
                    <RecommendationButton
                      key={rec}
                      value={rec}
                      selected={feedback.recommendation === rec}
                      onClick={(val) => setFeedback(prev => ({ ...prev, recommendation: val }))}
                      isDarkMode={false}
                    />
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Strengths</label>
                  <textarea value={feedback.strengths} onChange={(e) => setFeedback(prev => ({ ...prev, strengths: e.target.value }))}
                    rows={3} placeholder="Key strengths observed..."
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 resize-none placeholder:text-[#9B9BAD]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Areas for Improvement</label>
                  <textarea value={feedback.weaknesses} onChange={(e) => setFeedback(prev => ({ ...prev, weaknesses: e.target.value }))}
                    rows={3} placeholder="Areas that need improvement..."
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 resize-none placeholder:text-[#9B9BAD]/50"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Additional Notes</label>
                <textarea value={feedback.notes} onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3} placeholder="Any additional observations or comments..."
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 resize-none placeholder:text-[#9B9BAD]/50"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={onClose}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewFeedbackModal;
