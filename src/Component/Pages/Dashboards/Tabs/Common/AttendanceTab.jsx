import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiLogIn, FiLogOut, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { checkIn, checkOut, getMyAttendance } from '../../../service/api';

const AttendanceTab = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyAttendance(month, year);
      const data = res.data || [];
      setRecords(data);
      const today = new Date().toISOString().split('T')[0];
      const todayRec = data.find(r => r.date === today);
      setTodayRecord(todayRec || null);
      setCheckedIn(todayRec && todayRec.checkIn && !todayRec.checkOut);
    } catch (err) {
      showToast(err.message || 'Failed to load attendance', 'error');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await checkIn();
      showToast('Checked in successfully!');
      fetchAttendance();
    } catch (err) {
      showToast(err.message || 'Failed to check in', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await checkOut();
      showToast('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      showToast(err.message || 'Failed to check out', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const changeMonth = (dir) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  };

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const statusColors = {
    present: { bg: '#d1fae5', color: '#10b981' },
    absent: { bg: '#fee2e2', color: '#ef4444' },
    'half-day': { bg: '#fef3c7', color: '#f59e0b' },
    leave: { bg: '#e0e7ff', color: '#6366f1' },
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const halfDayCount = records.filter(r => r.status === 'half-day').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium"
            style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
          <p className="text-gray-500 text-sm mt-1">Track your daily attendance</p>
        </div>
      </div>

      {/* Check In/Out Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold">Today's Attendance</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {todayRecord?.checkIn && (
              <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Check-in: {todayRecord.checkIn}
                {todayRecord.checkOut ? ` | Check-out: ${todayRecord.checkOut}` : ''}
                {todayRecord.workHours ? ` | ${todayRecord.workHours}h worked` : ''}
              </p>
            )}
          </div>
          {!todayRecord?.checkOut && (
            <button
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg"
              style={{ background: checkedIn ? '#ef4444' : '#10b981', color: '#fff' }}
            >
              {checkedIn ? (
                <><FiLogOut style={{ width: '18px', height: '18px' }} />{actionLoading ? 'Checking out...' : 'Check Out'}</>
              ) : (
                <><FiLogIn style={{ width: '18px', height: '18px' }} />{actionLoading ? 'Checking in...' : 'Check In'}</>
              )}
            </button>
          )}
          {todayRecord?.checkOut && (
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <FiCheckCircle style={{ width: '18px', height: '18px' }} /> Day Complete
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present', count: presentCount, color: '#10b981' },
          { label: 'Absent', count: absentCount, color: '#ef4444' },
          { label: 'Half Day', count: halfDayCount, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Month Nav */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <FiChevronLeft style={{ width: '20px', height: '20px', color: '#6b7280' }} />
        </button>
        <span className="font-semibold text-gray-800">{monthName}</span>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100">
          <FiChevronRight style={{ width: '20px', height: '20px', color: '#6b7280' }} />
        </button>
      </div>

      {/* Records */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <FiClock style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">No attendance records this month</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((rec, idx) => {
            const sc = statusColors[rec.status] || statusColors.present;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800 w-24">
                    {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {rec.checkIn || '--:--'} → {rec.checkOut || '--:--'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {rec.workHours && <span className="text-xs font-medium text-gray-500">{rec.workHours}h</span>}
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ color: sc.color, background: sc.bg }}
                  >
                    {rec.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
