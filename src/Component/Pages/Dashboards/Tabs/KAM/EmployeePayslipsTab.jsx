import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiDownload, FiMail, FiPrinter, FiEye, FiCheck } from 'react-icons/fi';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const EmployeePayslipsTab = ({ isDarkMode }) => {
  const [selectedMonth, setSelectedMonth] = useState('June 2026');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [employees] = useState([
    { id: '1', empId: 'EMP001', name: 'Rahul Sharma', designation: 'Staff', department: 'HR Operations', basic: 50000, hra: 20000, allowances: 10000, deductions: 5000, netPay: 75000 },
    { id: '2', empId: 'EMP002', name: 'Priya Singh', designation: 'Team Lead', department: 'Recruitment', basic: 65000, hra: 25000, allowances: 12000, deductions: 7000, netPay: 95000 },
    { id: '3', empId: 'EMP003', name: 'Amit Kumar', designation: 'Manager', department: 'Sales', basic: 80000, hra: 30000, allowances: 15000, deductions: 10000, netPay: 115000 },
    { id: '4', empId: 'EMP004', name: 'Sneha Patel', designation: 'Developer', department: 'Technology', basic: 70000, hra: 28000, allowances: 14000, deductions: 8000, netPay: 104000 },
    { id: '5', empId: 'EMP005', name: 'Vikram Rao', designation: 'Executive', department: 'Marketing', basic: 45000, hra: 18000, allowances: 9000, deductions: 4000, netPay: 68000 }
  ]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkEmail = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    toast.success(`Payslips emailed successfully to ${selectedIds.length} employees.`);
  };

  const handleBulkDownload = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    toast.success(`Generated and downloaded PDF archive for ${selectedIds.length} employees.`);
  };

  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

  const convertNumberToWords = (num) => {
    // Basic number to words converter mock
    const map = {
      68000: 'Sixty Eight Thousand Rupees Only',
      75000: 'Seventy Five Thousand Rupees Only',
      95000: 'Ninety Five Thousand Rupees Only',
      104000: 'One Lakh Four Thousand Rupees Only',
      115000: 'One Lakh Fifteen Thousand Rupees Only'
    };
    return map[num] || 'Rupees Only';
  };

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="border-b pb-5 border-[#F4F3EF] dark:border-slate-800 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Employee Payslips</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Audit, print, and distribute individual monthly salary payslips</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 outline-none border cursor-pointer ${
              isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-[#1A1A2E] border-[#E8E7E2]'
            }`}
          >
            <option>June 2026</option>
            <option>May 2026</option>
            <option>April 2026</option>
          </select>
        </div>
      </div>

      {/* Bulk actions and tools */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left mt-6 mb-6">
        <div className="text-sm text-slate-450 font-bold">
          {selectedIds.length} of {employees.length} selected
        </div>

        <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleBulkEmail}
            className="flex items-center justify-center gap-2 px-6 py-3 min-w-[160px] rounded-xl border border-[#0D47A1] text-[#0D47A1] dark:text-blue-400 dark:border-blue-400 text-sm font-bold hover:bg-[#0D47A1]/5 active:scale-95 transition-all flex-1 sm:flex-none"
          >
            <FiMail size={16} /> Email Payslips
          </button>
          <button
            onClick={handleBulkDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 min-w-[180px] bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] active:scale-95 transition-all flex-1 sm:flex-none shadow-md"
          >
            <FiDownload size={16} /> Download Bulk PDF
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} text-left`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/40 text-xs font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Earnings</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Salary</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const isSelected = selectedIds.includes(emp.id);
                return (
                  <tr 
                    key={emp.id} 
                    onClick={() => setSelectedPayslip(emp)}
                    className="border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all text-xs cursor-pointer"
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(emp.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                      {emp.name} <span className="text-[9px] text-slate-400 block font-medium mt-0.5">{emp.empId}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-semibold">{emp.designation} · {emp.department}</td>
                    <td className="px-6 py-4 text-slate-650 font-semibold">{formatCurrency(emp.basic + emp.hra + emp.allowances)}</td>
                    <td className="px-6 py-4 text-rose-500 font-semibold">-{formatCurrency(emp.deductions)}</td>
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-white">{formatCurrency(emp.netPay)}</td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedPayslip(emp)}
                        className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center hover:scale-105 transition-all mx-auto"
                        title="View Payslip"
                      >
                        <FiEye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {createPortal(
        <AnimatePresence>
          {selectedPayslip && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPayslip(null)} className="fixed inset-0 bg-[#1A1A2E]/45 backdrop-blur-md z-[9999]" />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-full sm:w-[600px] md:w-[800px] bg-white shadow-2xl overflow-y-auto flex flex-col z-[10000] text-left"
              >
                <div className="border-b border-[#F4F3EF] px-8 py-5 flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF] sticky top-0 z-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1A1A2E] font-syne">Statement of Salary Slip</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        toast.success('Triggering print dialog...');
                        window.print();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#0D47A1] text-[#0D47A1] rounded-xl text-xs font-bold hover:bg-[#0D47A1]/5 transition-all"
                    >
                      <FiPrinter size={13} /> Print
                    </button>
                    <button onClick={() => setSelectedPayslip(null)} className="w-9 h-9 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-10 space-y-8 print:p-0">
                  <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#0D47A1] tracking-tight uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>Mabicons Digital Solutions</h2>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 max-w-xs leading-normal">
                        Internal Operations Main Ledger, Malviya Nagar, Jaipur, Rajasthan, 302017
                      </p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-sm text-[#1A1A2E]">SALARY SLIP</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{selectedMonth}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-[11px] font-semibold border-b border-slate-100 pb-6">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider mb-0.5">Employee Name</span>
                      <span className="text-slate-800 font-bold text-xs">{selectedPayslip.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider mb-0.5">Employee ID</span>
                      <span className="text-slate-800 font-bold text-xs">{selectedPayslip.empId}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider mb-0.5">Designation</span>
                      <span className="text-slate-800 font-bold text-xs">{selectedPayslip.designation}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider mb-0.5">Department</span>
                      <span className="text-slate-800 font-bold text-xs">{selectedPayslip.department}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px]">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700">Earnings Components</div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Basic Pay</span>
                          <span className="font-bold text-slate-800">{formatCurrency(selectedPayslip.basic)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">House Rent Allowance (HRA)</span>
                          <span className="font-bold text-slate-800">{formatCurrency(selectedPayslip.hra)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Conveyance & Allowances</span>
                          <span className="font-bold text-slate-800">{formatCurrency(selectedPayslip.allowances)}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50/70 border-t border-slate-200 px-4 py-2.5 flex justify-between items-center font-extrabold text-slate-800">
                        <span>Gross Earnings</span>
                        <span>{formatCurrency(selectedPayslip.basic + selectedPayslip.hra + selectedPayslip.allowances)}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700">Deductions Audit</div>
                      <div className="p-4 space-y-3 text-rose-650">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Provident Fund (PF)</span>
                          <span className="font-bold">-{formatCurrency(selectedPayslip.deductions * 0.5)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Income Tax & TDS</span>
                          <span className="font-bold">-{formatCurrency(selectedPayslip.deductions * 0.3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Professional Tax</span>
                          <span className="font-bold">-{formatCurrency(selectedPayslip.deductions * 0.2)}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50/70 border-t border-slate-200 px-4 py-2.5 flex justify-between items-center font-extrabold text-slate-800">
                        <span>Total Deductions</span>
                        <span className="text-rose-600">-{formatCurrency(selectedPayslip.deductions)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0D47A1] text-white flex justify-between items-center gap-6 shadow-lg">
                    <div>
                      <span className="text-[9px] text-white/50 block font-black uppercase tracking-wider">Net Salary Payable</span>
                      <h4 className="text-2xl font-black mt-1 leading-none">{formatCurrency(selectedPayslip.netPay)}</h4>
                      <p className="text-[10px] text-white/40 font-bold mt-2 uppercase tracking-wide italic">Amount in Words: {convertNumberToWords(selectedPayslip.netPay)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <FiCheck size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default EmployeePayslipsTab;
