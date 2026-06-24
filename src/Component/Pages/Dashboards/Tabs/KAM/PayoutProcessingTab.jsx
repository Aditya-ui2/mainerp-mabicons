import { useState } from 'react';
import { FiDownload, FiDollarSign, FiCheckCircle, FiUsers, FiAward } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const PayoutProcessingTab = ({ isDarkMode }) => {
  const [disbursed, setDisbursed] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');

  const [payoutList, setPayoutList] = useState([
    { id: '1', empId: 'EMP001', name: 'Rahul Sharma', bank: 'HDFC Bank', accNo: '50100482910394', ifsc: 'HDFC0000047', netPay: 75000 },
    { id: '2', empId: 'EMP002', name: 'Priya Singh', bank: 'ICICI Bank', accNo: '000401582910', ifsc: 'ICIC0000004', netPay: 95000 },
    { id: '3', empId: 'EMP003', name: 'Amit Kumar', bank: 'Axis Bank', accNo: '912010048291039', ifsc: 'UTIB0000082', netPay: 115000 },
    { id: '4', empId: 'EMP004', name: 'Sneha Patel', designation: 'Developer', bank: 'SBI', accNo: '30491829103', ifsc: 'SBIN0004021', netPay: 104000 },
    { id: '5', empId: 'EMP005', name: 'Vikram Rao', bank: 'HDFC Bank', accNo: '50100482910839', ifsc: 'HDFC0000047', netPay: 68000 }
  ]);

  const totalPayout = payoutList.reduce((sum, item) => sum + item.netPay, 0);

  const handleDownloadBankFile = () => {
    toast.success('HDFC bank salary upload text file generated and downloaded successfully.');
  };

  const handleDisbursePayments = () => {
    setDisbursed(true);
    toast.success('Payout completed! Salaries marked as Disbursed in the system.');
  };

  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="border-b pb-5 border-[#F4F3EF] dark:border-slate-800 text-left">
        <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Payout Processing</h1>
        <p className="text-sm font-medium text-[#9B9BAD] mt-1">Disburse salaries, download bank formats, and audit bank statements</p>
      </div>

      {/* Disbursement analytics bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-bold">
            <FiUsers size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Employees</span>
            <h3 className="text-xl font-bold text-[#1A1A2E] dark:text-white mt-1">{payoutList.length} Members</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-bold">
            <FiDollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Outflow</span>
            <h3 className="text-xl font-bold text-[#1A1A2E] dark:text-white mt-1">{formatCurrency(totalPayout)}</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-bold">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Status</span>
            <h3 className={`text-xl font-bold mt-1 ${disbursed ? 'text-emerald-600' : 'text-amber-500'}`}>
              {disbursed ? 'Disbursed' : 'Awaiting Release'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main payout area */}
      <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} text-left`}>
        <div className="p-6 border-b border-[#F4F3EF] dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white font-syne">Employee Payout Listing</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Audit employee bank accounts and transaction values</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownloadBankFile}
              className="flex items-center gap-2 px-4 py-2 border border-[#0D47A1] text-[#0D47A1] dark:text-blue-400 dark:border-blue-400 rounded-xl text-xs font-bold hover:bg-[#0D47A1]/5 transition-all"
            >
              <FiDownload size={14} /> Download Bank File
            </button>
            <button
              disabled={disbursed}
              onClick={handleDisbursePayments}
              className="px-5 py-2.5 bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Release Payouts
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/40">
                {['Employee', 'Bank Name', 'Account Number', 'IFSC Code', 'Payout Value', 'Status'].map((header) => (
                  <th key={header} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payoutList.map((item) => (
                <tr key={item.id} className="border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all text-xs">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                    {item.name} <span className="text-[9px] text-slate-400 block font-medium mt-0.5">{item.empId}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-550 font-semibold">{item.bank}</td>
                  <td className="px-6 py-4 text-slate-500 font-semibold">{item.accNo}</td>
                  <td className="px-6 py-4 text-slate-500 font-semibold uppercase">{item.ifsc}</td>
                  <td className="px-6 py-4 font-black text-slate-800 dark:text-white">{formatCurrency(item.netPay)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      disbursed 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                        : 'bg-amber-50 text-amber-500 dark:bg-amber-950/20'
                    }`}>
                      {disbursed ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutProcessingTab;
