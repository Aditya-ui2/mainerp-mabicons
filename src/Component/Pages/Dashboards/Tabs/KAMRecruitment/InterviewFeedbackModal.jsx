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
import { submitInterviewFeedback, getInterviewFeedbackForm } from '../service/api';

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <FiStar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Interview Feedback
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {interview?.candidate?.name || interview?.candidateName} • {interview?.position?.title || interview?.position}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheck className="w-10 h-10 text-green-600" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Feedback Submitted!
              </h3>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Thank you for your evaluation
              </p>
            </motion.div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="p-5 space-y-6">
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-red-100 text-red-700"
                >
                  <FiAlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {/* Overall Score Display */}
              <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Overall Rating
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Auto-calculated based on criteria
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
                      style={{ 
                        background: calculateOverall() <= 3 
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                          : calculateOverall() <= 5 
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                            : calculateOverall() <= 7 
                              ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                              : 'linear-gradient(135deg, #10b981, #059669)'
                      }}
                    >
                      {calculateOverall()}
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      / 10
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Criteria */}
              <div>
                <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Evaluation Criteria
                </h3>
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
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Recommendation *
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend', 'Strongly Not Recommend'].map((rec) => (
                    <RecommendationButton
                      key={rec}
                      value={rec}
                      selected={feedback.recommendation === rec}
                      onClick={(val) => setFeedback(prev => ({ ...prev, recommendation: val }))}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Strengths
                  </label>
                  <textarea
                    value={feedback.strengths}
                    onChange={(e) => setFeedback(prev => ({ ...prev, strengths: e.target.value }))}
                    rows={3}
                    className={`w-full mt-2 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-purple-500/50 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Key strengths observed..."
                  />
                </div>
                <div>
                  <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Areas for Improvement
                  </label>
                  <textarea
                    value={feedback.weaknesses}
                    onChange={(e) => setFeedback(prev => ({ ...prev, weaknesses: e.target.value }))}
                    rows={3}
                    className={`w-full mt-2 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-purple-500/50 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Areas that need improvement..."
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Additional Notes
                </label>
                <textarea
                  value={feedback.notes}
                  onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className={`w-full mt-2 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-purple-500/50 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                  placeholder="Any additional observations or comments..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Feedback'
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InterviewFeedbackModal;
