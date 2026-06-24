import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiEdit, FiDollarSign, FiFileText, FiChevronRight, FiCheck } from 'react-icons/fi';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const SalaryTab = ({ isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([
    { id: '1', empId: 'EMP001', name: 'Rahul Sharma', designation: 'Staff', department: 'HR Operations', ctc: 1000000 },
    { id: '2', empId: 'EMP002', name: 'Priya Singh', designation: 'Team Lead', department: 'Recruitment', ctc: 1250000 },
    { id: '3', empId: 'EMP003', name: 'Amit Kumar', designation: 'Manager', department: 'Sales', ctc: 1500000 },
    { id: '4', empId: 'EMP004', name: 'Sneha Patel', designation: 'Developer', department: 'Technology', ctc: 1400000 },
    { id: '5', empId: 'EMP005', name: 'Vikram Rao', designation: 'Executive', department: 'Marketing', ctc: 900000 },
    { id: '6', empId: 'EMP006', name: 'Anjali Gupta', designation: 'Specialist', department: 'HR Operations', ctc: 1100000 },
    { id: '7', empId: 'EMP007', name: 'Sanjay Dutt', designation: 'Analyst', department: 'Sales', ctc: 1180000 },
    { id: '8', empId: 'EMP008', name: 'Meera Reddy', designation: 'Designer', department: 'Technology', ctc: 1420000 },
    { id: '9', empId: 'EMP009', name: 'Karan Mehra', designation: 'Consultant', department: 'Recruitment', ctc: 1350000 },
    { id: '10', empId: 'EMP010', name: 'Pooja Varma', designation: 'Coordinator', department: 'Marketing', ctc: 960000 }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [newCtc, setNewCtc] = useState(0);

  useEffect(() => {
    // Load modified values from localStorage if they exist
    const stored = localStorage.getItem('mabicons_salary_ctc_data');
    if (stored) {
      setEmployees(JSON.parse(stored));
    }
  }, []);

  const saveEmployeesToStorage = (updated) => {
    localStorage.setItem('mabicons_salary_ctc_data', JSON.stringify(updated));
    setEmployees(updated);
  };

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0]);
    } else if (selectedEmployee) {
      // Keep selected employee in sync with modifications
      const latest = employees.find(e => e.id === selectedEmployee.id);
      if (latest) setSelectedEmployee(latest);
    }
  }, [employees]);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper salary structure calculators based on CTC
  const calculateStructure = (ctcValue) => {
    const annual = parseFloat(ctcValue);
    const monthlyGross = Math.round(annual / 12);
    const basic = Math.round(monthlyGross * 0.5); // 50% basic
    const hra = Math.round(basic * 0.4); // 40% of basic
    const pf = Math.round(basic * 0.12); // 12% basic
    const profTax = 200;
    const specialAllowance = monthlyGross - (basic + hra + pf + profTax);
    const deductions = pf + profTax + Math.round(monthlyGross * 0.05); // estimate TDS as 5%
    const netSalary = monthlyGross - deductions;

    return {
      annualCTC: annual,
      monthlyGross,
      basic,
      hra,
      specialAllowance,
      pf,
      profTax,
      deductions,
      netSalary
    };
  };

  const handleReviseSalary = (e) => {
    e.preventDefault();
    if (newCtc < 120000) {
      toast.error('CTC must be at least ₹1,20,000 annually');
      return;
    }
    const updated = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return { ...emp, ctc: parseFloat(newCtc) };
      }
      return emp;
    });
    saveEmployeesToStorage(updated);
    setShowRevisionModal(false);
    toast.success(`CTC revised successfully for ${selectedEmployee.name}`);
  };

  const formatCurrency = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  const currentSal = selectedEmployee ? calculateStructure(selectedEmployee.ctc) : null;

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="border-b pb-5 border-[#F4F3EF] dark:border-slate-800 text-left">
        <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Salary Structure</h1>
        <p className="text-sm font-medium text-[#9B9BAD] mt-1">Audit and revise employee CTC breakdowns and pay components</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Master List */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-5`}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee by name/ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full text-xs font-bold rounded-xl pl-10 pr-10 py-3 outline-none border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 text-white border-slate-700 focus:ring-2 focus:ring-slate-700' 
                    : 'bg-[#F4F3EF] text-[#1A1A2E] border-[#E8E7E2] focus:ring-2 focus:ring-[#EEF2FB]'
                }`}
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployee?.id === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? 'border-[#0D47A1] bg-blue-50/25 dark:bg-blue-950/10' 
                        : isDarkMode 
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-750' 
                          : 'bg-white border-[#F4F3EF] hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-bold text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-850 dark:text-white group-hover:text-[#0D47A1] transition-colors">{emp.name}</h5>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.empId} · {emp.designation}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(emp.ctc / 12)} <span className="text-[9px] text-slate-400 block font-medium">/ month</span>
                      </div>
                      <FiChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedEmployee && currentSal && (
            <div className={`p-8 rounded-[32px] border text-left ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-8`}>
              {/* Header profile details */}
              <div className="flex justify-between items-start border-b border-[#F4F3EF] dark:border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-[#0D47A1] flex items-center justify-center font-bold text-lg">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-white font-syne">{selectedEmployee.name}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedEmployee.empId} • {selectedEmployee.designation} • {selectedEmployee.department}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setNewCtc(selectedEmployee.ctc);
                    setShowRevisionModal(true);
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-[#0a3a82] active:scale-95 transition-all shadow-sm shrink-0"
                >
                  <FiEdit size={12} /> Revise Salary
                </button>
              </div>

              {/* Stats overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-slate-850 border border-[#F4F3EF] dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Annual CTC</span>
                  <p className="text-lg font-black text-[#1A1A2E] dark:text-white">{formatCurrency(currentSal.annualCTC)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-slate-850 border border-[#F4F3EF] dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Monthly Gross</span>
                  <p className="text-lg font-black text-[#1A1A2E] dark:text-white">{formatCurrency(currentSal.monthlyGross)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 dark:bg-emerald-950/20">
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Estimated Net Pay</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-450">{formatCurrency(currentSal.netSalary)}</p>
                </div>
              </div>

              {/* Pay Item components lists */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-[#F4F3EF] dark:border-slate-800 pb-2 mb-3">Earnings Components</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-slate-500">Basic Salary (50%)</span>
                      <span className="font-extrabold text-[#1A1A2E] dark:text-white">{formatCurrency(currentSal.basic)}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-slate-500">HRA (40% of Basic)</span>
                      <span className="font-extrabold text-[#1A1A2E] dark:text-white">{formatCurrency(currentSal.hra)}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-xl flex justify-between items-center col-span-2">
                      <span className="font-bold text-slate-500">Special Allowance</span>
                      <span className="font-extrabold text-[#1A1A2E] dark:text-white">{formatCurrency(currentSal.specialAllowance)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-[#F4F3EF] dark:border-slate-800 pb-2 mb-3">Deductions Audit</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-rose-650">
                    <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-rose-600/70">Provident Fund (PF)</span>
                      <span className="font-extrabold">-{formatCurrency(currentSal.pf)}</span>
                    </div>
                    <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-rose-600/70">Professional Tax</span>
                      <span className="font-extrabold">-{formatCurrency(currentSal.profTax)}</span>
                    </div>
                    <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex justify-between items-center col-span-2">
                      <span className="font-bold text-rose-600/70">Statutory Tax & TDS Holds</span>
                      <span className="font-extrabold">-{formatCurrency(currentSal.deductions - (currentSal.pf + currentSal.profTax))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Salary Revision Modal */}
      {createPortal(
        <AnimatePresence>
          {showRevisionModal && selectedEmployee && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRevisionModal(false)} className="fixed inset-0 bg-[#1A1A2E]/45 backdrop-blur-md z-[9999]" />
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                >
                <div className="border-b border-[#F4F3EF] px-8 py-5 flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                  <h3 className="text-lg font-bold text-[#1A1A2E] font-syne">Revise Employee CTC</h3>
                  <button onClick={() => setShowRevisionModal(false)} className="w-9 h-9 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleReviseSalary} className="p-8 space-y-5 text-left">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/70 text-xs text-slate-500 leading-normal mb-2">
                    <span className="font-bold text-[#0D47A1]">Revision Policy:</span> Changing the Annual CTC will automatically recalculate Basic salary (50%), HRA, and standard PF statutory contributions.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Annual CTC (INR) *</label>
                    <input
                      type="number"
                      value={newCtc}
                      onChange={(e) => setNewCtc(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 1200000"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none"
                    />
                  </div>

                  {newCtc > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                      <div className="p-3 bg-[#FAFAF8] rounded-xl">
                        <span className="text-[9px] font-black text-slate-400 block mb-1">New Monthly Gross</span>
                        <span className="font-extrabold text-[#1A1A2E]">{formatCurrency(newCtc / 12)}</span>
                      </div>
                      <div className="p-3 bg-[#FAFAF8] rounded-xl">
                        <span className="text-[9px] font-black text-slate-400 block mb-1">New Basic (50%)</span>
                        <span className="font-extrabold text-[#1A1A2E]">{formatCurrency((newCtc / 12) * 0.5)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-3">
                    <button type="button" onClick={() => setShowRevisionModal(false)} className="flex-1 py-4 rounded-2xl border border-[#F4F3EF] text-xs font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] bg-[#0D47A1] text-white py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#0a3a82] transition-all">Update CTC</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default SalaryTab;
