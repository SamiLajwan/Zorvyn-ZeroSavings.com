import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0d0d14 50%, #0a1628 100%)' }}>

      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 glow"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ZeroSavings<span style={{color:'#a78bfa'}}>.com</span></h1>
          <p className="text-slate-400 text-sm mt-1">Track every rupee, save every paisa</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/20"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-violet-500 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-violet-500 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 mt-2"
              style={{ background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 rounded-2xl p-4 border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { user: 'admin', pass: 'admin123', role: 'Admin', color: '#7c3aed' },
              { user: 'analyst', pass: 'analyst123', role: 'Analyst', color: '#2563eb' },
              { user: 'viewer', pass: 'viewer123', role: 'Viewer', color: '#059669' },
            ].map(a => (
              <button key={a.user} onClick={() => setForm({ username: a.user, password: a.pass })}
                className="flex flex-col items-center p-2.5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-bold" style={{ color: a.color }}>{a.role}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{a.user}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">Click a role to auto-fill</p>
        </div>
      </motion.div>
    </div>
  );
}
