import { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiShield, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const PayrollVerificationTab = ({ isDarkMode }) => {
  const [auditStatus, setAuditStatus] = useState('idle'); // idle, auditing, complete
  const [progress, setProgress] = useState(0);

  // Verification lists data
  const [variationLogs] = useState([
    { id: 'v1', name: 'Sanjay Dutt', empId: 'EMP007', field: 'Basic Salary', prev: 55000, current: 60000, reason: 'CTC Revised' },
    { id: 'v2', name: 'Vikram Rao', empId: 'EMP005', field: 'allowances', prev: 8000, current: 9000, reason: 'Travel Claim Approved' }
  ]);

  const [complianceWarnings] = useState([
    { id: 'c1', name: 'Sneha Patel', empId: 'EMP004', type: 'PAN Card', issue: 'PAN format invalid or unverified' },
    { id: 'c2', name: 'Rahul Sharma', empId: 'EMP001', type: 'UAN Number', issue: 'PF UAN not linked' }
  ]);

  const [lopLogs] = useState([
    { id: 'l1', name: 'Adil Ali Khan', empId: 'E0064', days: 1.5, type: 'Loss Of Pay', desc: 'Unapproved absence' },
    { id: 'l2', name: 'Aruna Rathore', empId: 'E0047', days: 2, type: 'Casual Leave (LOP)', desc: 'Leave balance exhausted' }
  ]);

  const runAudit = () => {
    setAuditStatus('auditing');
    setProgress(0);
  };

  useEffect(() => {
    if (auditStatus === 'auditing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setAuditStatus('complete');
              toast.success('Pre-run compliance check completed with 2 warnings.');
            }, 600);
            return 100;
          }
          return prev + 5;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [auditStatus]);

  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="border-b pb-5 border-[#F4F3EF] dark:border-slate-800 text-left">
        <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Payroll Verification</h1>
        <p className="text-sm font-medium text-[#9B9BAD] mt-1">Audit statutory compliance, check LOP deductions, and verify variations</p>
      </div>

      {/* Main compliance actions card */}
      <div className={`p-8 rounded-[32px] border text-left flex flex-col md:flex-row items-center justify-between gap-8 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
      }`}>
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-[#0D47A1] dark:text-blue-450">
            <FiShield size={20} />
            <h4 className="text-base font-bold font-syne">Pre-run Payroll Audit checklist</h4>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Running an audit verifies that all client data aligns with statutory guidelines. The check scans for missing PAN cards, invalid bank details, unapproved LOP records, and unexpected CTC deviations.
          </p>
        </div>

        <div>
          {auditStatus === 'idle' && (
            <button
              onClick={runAudit}
              className="px-8 py-4 bg-[#0D47A1] hover:bg-[#0a3a82] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Execute Audit Check
            </button>
          )}

          {auditStatus === 'auditing' && (
            <div className="flex items-center gap-3 bg-[#F4F3EF] dark:bg-slate-800 px-6 py-3.5 rounded-full">
              <FiLoader size={16} className="text-[#0D47A1] animate-spin" />
              <span className="text-xs font-bold text-[#0D47A1] dark:text-blue-400">Auditing Compliance... {progress}%</span>
            </div>
          )}

          {auditStatus === 'complete' && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-emerald-650 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-100 dark:bg-emerald-950/20">
                ✓ Audit Completed
              </span>
              <button
                onClick={runAudit}
                className="text-xs font-bold text-[#0D47A1] hover:underline"
              >
                Re-Run Check
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Panels List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* LOP & Attendance Checks */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-[#F4F3EF] dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white font-syne">LOP & Attendance Exceptions</h4>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 font-bold">Check Required</span>
            </div>

            <div className="space-y-3">
              {lopLogs.map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/50 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white">{log.name} <span className="text-[10px] text-slate-400">({log.empId})</span></h5>
                    <p className="text-[10px] text-slate-450 font-medium mt-1">{log.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-500">{log.days} Days LOP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Variations Checks */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-[#F4F3EF] dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white font-syne">Salary Variation Audits</h4>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[#0D47A1] font-bold">2 Changes</span>
            </div>

            <div className="space-y-3">
              {variationLogs.map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/50 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white">{log.name}</h5>
                    <p className="text-[10px] text-slate-450 font-semibold mt-1">Field: {log.field} · {log.reason}</p>
                  </div>
                  <div className="text-right font-bold text-slate-650">
                    <span className="text-slate-400 line-through mr-2">{formatCurrency(log.prev)}</span>
                    <span className="text-emerald-600 font-extrabold">{formatCurrency(log.current)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAN/UAN Statutory Compliance check */}
        <div className="lg:col-span-12 space-y-4">
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-[#F4F3EF] dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white font-syne">PAN & PF Compliance Logs</h4>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold">Action Needed</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complianceWarnings.map(warn => (
                <div key={warn.id} className="p-4 rounded-2xl border border-rose-100 bg-rose-500/5 flex items-start gap-3 text-xs">
                  <FiAlertCircle className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white">{warn.name} <span className="text-[10px] text-slate-400">({warn.empId})</span></h5>
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5 uppercase tracking-wide">{warn.type} Error</p>
                    <p className="text-[11px] text-slate-450 mt-1 font-medium">{warn.issue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollVerificationTab;
