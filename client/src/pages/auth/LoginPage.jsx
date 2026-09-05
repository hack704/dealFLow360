import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Layers, Lock, Mail, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-950 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Sign in to DealFlow<span className="text-indigo-400">360</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Deal Lifecycle & CPQ Management Platform
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@dealflow360.com"
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" loading={loading} variant="primary" className="w-full">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Sign-in Personas */}
          <div className="mt-6 pt-5 border-t border-slate-800/90">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono text-center mb-3">
              One-Click Demo Personas
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@dealflow360.com')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600/60 text-left transition-all group"
              >
                <div className="text-[11px] font-medium text-slate-200 group-hover:text-indigo-300">
                  Alex Rivera
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Sales Rep</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@dealflow360.com')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600/60 text-left transition-all group"
              >
                <div className="text-[11px] font-medium text-slate-200 group-hover:text-indigo-300">
                  Sarah Vance
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Manager</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@dealflow360.com')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600/60 text-left transition-all group"
              >
                <div className="text-[11px] font-medium text-slate-200 group-hover:text-indigo-300">
                  Marcus Chen
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Admin</div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
