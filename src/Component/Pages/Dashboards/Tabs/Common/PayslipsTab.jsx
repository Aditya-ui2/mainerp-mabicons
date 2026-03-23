import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { getMyPayslips } from '../../../service/api';

const PayslipsTab = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayslips(); }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await getMyPayslips();
      setPayslips(res.payslips || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    generated: { color: '#f59e0b', bg: '#fef3c7', icon: FiClock, label: 'Generated' },
    paid: { color: '#10b981', bg: '#d1fae5', icon: FiCheckCircle, label: 'Paid' },
  };

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const totalEarned = payslips.filter(p => p.status === 'paid').reduce((acc, p) => acc + (p.netSalary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payslips</h2>
        <p className="text-gray-500 text-sm mt-1">View your salary details and history</p>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Received</p>
          <p className="text-3xl font-bold mt-1">₹{totalEarned.toLocaleString('en-IN')}</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{payslips.filter(p => p.status === 'paid').length} payslips</p>
        </div>
      </motion.div>

      {/* Payslips List */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
        </div>
      ) : payslips.length === 0 ? (
        <div className="text-center py-16">
          <FaIndianRupeeSign style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">No payslips available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.map((slip, idx) => {
            const sc = statusConfig[slip.status] || statusConfig.generated;
            return (
              <motion.div
                key={slip.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ background: '#ede9fe' }}>
                      <FiCalendar style={{ width: '22px', height: '22px', color: '#6366f1' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{monthNames[slip.month]} {slip.year}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Basic: ₹{(slip.basicSalary || 0).toLocaleString('en-IN')}</span>
                        <span>HRA: ₹{(slip.hra || 0).toLocaleString('en-IN')}</span>
                        <span>Deductions: ₹{(slip.deductions || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: '#10b981' }}>₹{(slip.netSalary || 0).toLocaleString('en-IN')}</p>
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ color: sc.color, background: sc.bg }}
                      >
                        <sc.icon style={{ width: '10px', height: '10px' }} />
                        {sc.label}
                      </span>
                    </div>
                    {slip.fileUrl && (
                      <a
                        href={slip.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <FiDownload style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PayslipsTab;
