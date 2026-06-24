import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { candidateLogin } from './service/api';
import { toast } from 'sonner';
import logo from '../../assets/images/mabicons logo blue.png';

const CandidateLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await candidateLogin({ 
                email: identifier, 
                username: identifier, 
                password 
            });
            if (res.success) {
                toast.success(`Welcome back, ${res.data.name}!`);
                localStorage.setItem('token', res.token);
                localStorage.setItem('userType', 'candidate');
                localStorage.setItem('userName', res.data.name);
                navigate('/candidate-dashboard');
            }
        } catch (err) {
            const errorMsg = err.message || 'Incorrect User ID or Password';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 selection:bg-[#1B4DA0]/10">
            <div className="w-full max-w-[400px]">
                {/* Login Card */}
                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-[#F4F3EF] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                    {/* Logo Section Inside Card */}
                    <div className="flex flex-col items-center mb-10">
                        <img src={logo} alt="Mabicons" className="h-10 md:h-12 w-auto mb-2" />
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em]">Candidate Portal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                            <FiLock size={18} className="shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-wider leading-tight">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-6 text-left">
                        {/* UserID Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest block ml-1">User ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors">
                                    <FiUser size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter your ID"
                                    className="w-full bg-[#FAFAFA] border border-[#F4F3EF] text-[#1A1A2E] pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#1B4DA0]/30 focus:bg-white transition-all placeholder:text-[#9B9BAD]/50 text-sm font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest block ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors">
                                    <FiLock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#FAFAFA] border border-[#F4F3EF] text-[#1A1A2E] pl-12 pr-12 py-4 rounded-2xl outline-none focus:border-[#1B4DA0]/30 focus:bg-white transition-all placeholder:text-[#9B9BAD]/50 text-sm font-bold"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-[#9B9BAD] hover:text-[#1B4DA0] transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1B4DA0] hover:bg-[#153b7a] text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-[10px] mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>


            </div>
        </div>
    );
};

export default CandidateLogin;
