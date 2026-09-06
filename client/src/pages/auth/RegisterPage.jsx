import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building2, Briefcase, ArrowRight, Loader2 } from 'lucide-react';

const ROLES = [
  { value: 'sales_rep',     label: 'Sales Rep' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'finance',       label: 'Finance' },
  { value: 'admin',         label: 'Admin' }
];

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'sales_rep',
    department: 'Sales'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.email) return setError('Email is required');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2.5 pl-10 text-[14px] text-[#f5f5f7] placeholder-[#555] outline-none transition-colors focus:border-[#2997ff]/60 focus:bg-white/[0.06]';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2997ff]/15">
            <Briefcase size={22} className="text-[#2997ff]" />
          </div>
          <h1 className="text-[26px] font-bold text-[#f5f5f7]">Create your account</h1>
          <p className="mt-1 text-[14px] text-[#86868b]">Join DealFlow360 — enterprise CPQ platform</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-[#ff453a]/30 bg-[#ff453a]/10 px-4 py-3 text-[13px] text-[#ff453a]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <input id="register-name" type="text" placeholder="Full name" value={formData.name} onChange={set('name')} required className={inputClass} />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <input id="register-email" type="email" placeholder="Work email" value={formData.email} onChange={set('email')} required className={inputClass} />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <input id="register-password" type="password" placeholder="Password (min. 6 chars)" value={formData.password} onChange={set('password')} required className={inputClass} />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <input id="register-confirm-password" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={set('confirmPassword')} required className={inputClass} />
            </div>

            {/* Role */}
            <div className="relative">
              <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <select
                id="register-role"
                value={formData.role}
                onChange={set('role')}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value} className="bg-[#1c1c1e]">{r.label}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <input id="register-department" type="text" placeholder="Department (e.g. Sales)" value={formData.department} onChange={set('department')} className={inputClass} />
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2997ff] py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#2997ff]/90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="mt-4 text-center text-[13px] text-[#555]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2997ff] hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
