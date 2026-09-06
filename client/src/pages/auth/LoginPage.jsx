import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ChevronLeft, Target, Sliders, ShieldCheck } from 'lucide-react';
import IsometricIllustration from '../../components/auth/IsometricIllustration';

const PERSONAS = [
  { name: 'Alex Rivera', role: 'Sales Rep', email: 'alex@dealflow360.com' },
  { name: 'Sarah Vance', role: 'Manager', email: 'sarah@dealflow360.com' },
  { name: 'David Sterling', role: 'Finance / Ops', email: 'finance@dealflow360.com' },
  { name: 'Marcus Chen', role: 'Admin', email: 'admin@dealflow360.com' },
  { name: 'Acme Buyer', role: 'Customer Portal', email: 'procurement@acme.com', isCustomer: true },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithMagicLink, register } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'magic'
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('peter.parker@mail.com');
  const [password, setPassword] = useState('password123');
  const [company, setCompany] = useState('Acme Corp');
  const [role, setRole] = useState('sales_rep');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  // Auto-login via Magic Link URL parameter
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicToken = params.get('token') || params.get('magic');
    if (magicToken) {
      localStorage.setItem('dealflow_token', magicToken);
      navigate('/portal');
    }
  }, [navigate]);

  const handleSelectPersona = (index) => {
    setActivePersonaIndex(index);
    setEmail(PERSONAS[index].email);
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'magic' || email.includes('procurement') || email.includes('customer')) {
        const res = await loginWithMagicLink(email);
        navigate('/portal');
        return;
      }

      let res;
      if (activeTab === 'login') {
        res = await login(email, password);
      } else {
        res = await register({ name, email, password, role, department: company });
      }

      if (res?.data?.role === 'customer') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword = 'password123') => {
    const pIndex = PERSONAS.findIndex(p => p.email === demoEmail);
    if (pIndex !== -1) setActivePersonaIndex(pIndex);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      if (PERSONAS[pIndex]?.isCustomer || demoEmail.includes('procurement') || demoEmail.includes('customer')) {
        await loginWithMagicLink(demoEmail);
        navigate('/portal');
      } else {
        const res = await login(demoEmail, demoPassword);
        if (res?.data?.role === 'customer') {
          navigate('/portal');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithMagicLink(email || 'procurement@acme.com');
      setMagicSent(true);
      setTimeout(() => {
        navigate('/portal');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden auth-canvas bg-gradient-to-br from-[#ebf8f0] via-[#daf3e4] to-[#d0f0dc] dark:from-[#051710] dark:via-[#082217] dark:to-[#030e09] text-[#143228] dark:text-[#f5f5f7] flex flex-col xl:flex-row relative selection:bg-[#00cba0]/30 font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Full Page Ambient Glowing Green Orbs (Screenshot 2 & 3) */}
      <div className="fixed -top-24 -right-24 w-96 h-96 lg:w-[480px] lg:h-[480px] rounded-full bg-gradient-to-br from-[#00cba0]/30 to-[#10b981]/25 blur-3xl pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="fixed -bottom-28 -left-28 w-[420px] h-[420px] lg:w-[520px] lg:h-[520px] rounded-full bg-gradient-to-tr from-[#10b981]/30 to-[#00d2a0]/20 blur-3xl pointer-events-none -z-0" />
      <div className="fixed top-1/3 left-1/4 w-80 h-80 rounded-full bg-[#84cc16]/15 blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#00cba0]/20 blur-3xl pointer-events-none -z-0" />
      
      {/* 1. Left Minimalist Rail for Extra-Large Desktops (>= 1280px) */}
      <div className="hidden xl:flex w-16 border-r border-black/[0.06] dark:border-white/[0.08] flex-col items-center justify-between py-8 shrink-0 relative">
        {/* Brand Aperture Mark (Segmented ring matching reference screenshot) */}
        <div className="w-8 h-8 relative flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-7 h-7 -rotate-45">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#30d158" strokeWidth="4.5" strokeDasharray="25 65" strokeDashoffset="0" strokeLinecap="round" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#ff9f0a" strokeWidth="4.5" strokeDasharray="24 66" strokeDashoffset="-29" strokeLinecap="round" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#ff2d55" strokeWidth="4.5" strokeDasharray="25 65" strokeDashoffset="-58" strokeLinecap="round" />
          </svg>
        </div>

        {/* Floating Chevron Circular Button */}
        <button
          type="button"
          onClick={() => navigate('/quotations')}
          title="Back to Quotations"
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.15] shadow-md flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-white hover:scale-105 active:scale-95 transition-all z-20"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* System Version Indicator */}
        <span className="text-[11px] font-mono text-[#86868b] -rotate-90 origin-center whitespace-nowrap tracking-widest uppercase">
          v1.0.0
        </span>
      </div>

      {/* 2. Top-Right Floating Controls (Theme Switcher & Sign In/Up Toggle) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 flex items-center space-x-2.5">
        {/* Apple Segmented Sign-in / Sign-up pill */}
        <div className="p-0.5 sm:p-1 bg-black/[0.04] dark:bg-white/[0.08] rounded-full border border-black/[0.06] dark:border-white/[0.10] flex items-center backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`px-3 sm:px-3.5 py-1 rounded-full text-[12px] sm:text-[13px] font-medium transition-all whitespace-nowrap ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`px-3 sm:px-3.5 py-1 rounded-full text-[12px] sm:text-[13px] font-medium transition-all whitespace-nowrap ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white border border-black/[0.06] dark:border-white/[0.10] transition-all flex items-center justify-center shadow-sm"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#ff9f0a]" />
          ) : (
            <Moon className="w-4 h-4 text-[#0071e3]" />
          )}
        </button>
      </div>

      {/* 3. Main Responsive Workspace: Separated Layout */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 md:pt-6 lg:pt-0 pb-12 md:pb-6 lg:pb-0 w-full h-full overflow-y-auto lg:overflow-visible z-10">
        
        {/* Responsive Two-Column Layout Grid */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-6 lg:gap-12 xl:gap-16 my-auto">
          
          {/* Left Column: ONLY the Login Card gets the Frosted Green Glass Body */}
          <div className="w-full md:w-[48%] lg:w-[45%] max-w-[440px] shrink-0 flex flex-col justify-center my-auto relative z-10">
            
            {/* The Green Frosted Glass Body Card */}
            <div className="w-full backdrop-blur-2xl bg-[#f0fbf5]/85 dark:bg-[#062418]/85 border-2 border-[#86efac]/80 dark:border-[#00cba0]/40 shadow-[0_24px_60px_-15px_rgba(0,203,160,0.25)] dark:shadow-[0_24px_60px_-15px_rgba(0,203,160,0.22)] rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 relative overflow-hidden transition-all">
              
              {/* Soft luminous ambient accents inside the card */}
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#00cba0]/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#10b981]/15 blur-2xl pointer-events-none" />

              {/* Brand Mark (shown on < xl screens) */}
              <div className="xl:hidden mb-5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/quotations')}
                    className="p-1.5 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#86868b] transition-colors"
                    title="Back to Quotations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <svg viewBox="0 0 36 36" className="w-6 h-6 -rotate-45">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#00cba0" strokeWidth="4.5" strokeDasharray="25 65" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#ff9f0a" strokeWidth="4.5" strokeDasharray="24 66" strokeDashoffset="-29" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#ff2d55" strokeWidth="4.5" strokeDasharray="25 65" strokeDashoffset="-58" strokeLinecap="round" />
                  </svg>
                  <span className="text-[14px] font-semibold tracking-tight text-[#143228] dark:text-white">DealFlow360</span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-5 sm:mb-6 relative z-10">
                <h1 className="text-[20px] sm:text-[22px] font-bold text-[#143228] dark:text-white tracking-tight leading-snug">
                  Sign in to DealFlow360<br />
                  <span className="text-[#00a884] dark:text-[#00cba0]">Analysis Dashboard</span>
                </h1>
                <p className="mt-1.5 text-[12.5px] sm:text-[13px] text-[#4b6358] dark:text-[#9bb8ad]">
                  AI-driven deal lifecycle & margin governance
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[13px] text-[#ff3b30] relative z-10">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 relative z-10">
                {activeTab === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[12px] font-medium text-[#4b6358] dark:text-[#9bb8ad]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jordan Rao"
                        className="w-full auth-card-input rounded-xl border border-[#a7f3d0] dark:border-[#059669]/50 px-3.5 text-[13.5px] text-[#111827] dark:text-white placeholder-[#86868b]/50 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[12px] font-medium text-[#4b6358] dark:text-[#9bb8ad]">
                        Organization
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full auth-card-input rounded-xl border border-[#a7f3d0] dark:border-[#059669]/50 px-3.5 text-[13.5px] text-[#111827] dark:text-white placeholder-[#86868b]/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-[#4b6358] dark:text-[#9bb8ad]">
                    Username or Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="peter.parker@mail.com"
                    className="w-full auth-card-input rounded-xl border border-[#a7f3d0] dark:border-[#059669]/50 px-3.5 text-[13.5px] text-[#111827] dark:text-white placeholder-[#86868b]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-[#4b6358] dark:text-[#9bb8ad]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full auth-card-input rounded-xl border border-[#a7f3d0] dark:border-[#059669]/50 px-3.5 text-[13.5px] text-[#111827] dark:text-white placeholder-[#86868b]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Remember Me Checkbox & Forgot Password */}
                <div className="flex items-center justify-between pt-0.5 text-[12px] sm:text-[12.5px]">
                  <label className="flex items-center space-x-2 text-[#4b6358] dark:text-[#9bb8ad] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border border-[#a7f3d0] dark:border-[#059669] bg-transparent accent-[#00cba0] cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Password recovery instructions sent to your email.')}
                    className="text-[#4b6358] hover:text-[#00cba0] dark:text-[#9bb8ad] dark:hover:text-[#00cba0] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Deep Green Sign In Button */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#1c493a] to-[#25634d] hover:from-[#15382c] hover:to-[#1e523f] text-white text-[13.5px] font-medium tracking-wide shadow-[0_4px_14px_rgba(28,73,58,0.22)] hover:shadow-[0_8px_20px_rgba(0,203,160,0.25)] transition-all hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center disabled:opacity-60"
                  >
                    {loading ? 'Signing in...' : activeTab === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </form>

              {/* Slider & Quick Personas */}
              <div className="mt-5 pt-4 border-t border-[#00cba0]/20 dark:border-white/[0.08] relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                      Quick Personas
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00cba0] animate-pulse" />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Slider Dots */}
                    <div className="flex items-center gap-1.5">
                      {PERSONAS.map((p, idx) => (
                        <button
                          key={p.email}
                          type="button"
                          onClick={() => handleSelectPersona(idx)}
                          className={`transition-all rounded-full ${
                            activePersonaIndex === idx
                              ? 'w-4 h-1.5 bg-[#00cba0]'
                              : 'w-1.5 h-1.5 bg-black/20 dark:bg-white/25 hover:bg-[#00cba0]/60'
                          }`}
                          title={`Select ${p.name}`}
                        />
                      ))}
                    </div>
                    {/* Slide Counter */}
                    <span className="text-[11.5px] font-mono font-bold text-[#00cba0]">
                      0{activePersonaIndex + 1}
                    </span>
                  </div>
                </div>

                {/* 1-Click Persona Quick Pills (5 Personas: Rep, Manager, Finance / Ops, Admin, Customer) */}
                <div className="grid grid-cols-2 gap-2">
                  {PERSONAS.map((p, idx) => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => {
                        handleSelectPersona(idx);
                        handleDemoLogin(p.email);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl text-left transition-all border ${
                        p.isCustomer ? 'col-span-2 sm:col-span-2' : ''
                      } ${
                        activePersonaIndex === idx
                          ? 'bg-[#00cba0]/15 border-[#00cba0] shadow-xs text-[#064e3b] dark:text-[#00cba0] font-semibold'
                          : 'bg-white/70 dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] text-[#4b6358] dark:text-[#9bb8ad] hover:border-[#00cba0]/50'
                      }`}
                    >
                      <div className="text-[12px] sm:text-[12.5px] font-medium text-[#111827] dark:text-white truncate flex items-center justify-between">
                        <span>{p.name}</span>
                        {p.isCustomer && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00cba0]/20 text-[#00a884] dark:text-[#00cba0] font-mono">PORTAL</span>}
                      </div>
                      <div className="text-[10px] sm:text-[10.5px] font-mono text-[#00a884] dark:text-[#00cba0] opacity-90 truncate mt-0.5">{p.role}</div>
                    </button>
                  ))}
                </div>

                {/* Direct Magic Link Instant Access Pill */}
                <button
                  type="button"
                  onClick={() => handleMagicLinkSubmit()}
                  className="w-full mt-2.5 py-2 px-3 rounded-xl bg-[#00cba0]/10 hover:bg-[#00cba0]/20 text-[#00a884] dark:text-[#00cba0] text-[12px] font-medium transition-colors border border-[#00cba0]/30 flex items-center justify-center gap-1.5"
                >
                  <span>🔗 Customer Portal: Instant Magic Link Login</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: 3D Isometric Illustration floating freely, separated from the card */}
          <div className="w-full md:w-[52%] lg:w-[55%] flex items-center justify-center md:justify-end px-2 sm:px-4 my-auto shrink-0 relative">
            <IsometricIllustration className="max-w-[280px] sm:max-w-[340px] md:max-w-[430px] lg:max-w-[530px] xl:max-w-[620px] drop-shadow-[0_25px_40px_rgba(0,0,0,0.12)]" />
          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;
