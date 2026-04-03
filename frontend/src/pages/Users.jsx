import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersApi } from '../api';

const EMPTY = { username: '', password: '', email: '', role: 'VIEWER' };
const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const ROLE_CFG = {
  ADMIN:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', label: 'Admin' },
  ANALYST: { color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.25)',  label: 'Analyst' },
  VIEWER:  { color: '#059669', bg: 'rgba(5,150,105,0.12)',  border: 'rgba(5,150,105,0.25)',  label: 'Viewer' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] || ROLE_CFG.VIEWER;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <input {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none border border-white/8 focus:border-violet-500/60 transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const fetchUsers = () => usersApi.getAll().then(r => setUsers(r.data));
  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal(true); };
  const openEdit = u => { setForm({ username: u.username, password: '', email: u.email, role: u.role }); setEditId(u.id); setError(''); setModal(true); };

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    try {
      editId ? await usersApi.update(editId, { email: form.email, role: form.role }) : await usersApi.create(form);
      setModal(false); fetchUsers();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const toggleStatus = async u => { await usersApi.update(u.id, { status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); fetchUsers(); };
  const handleDelete = async id => { if (!window.confirm('Delete this user?')) return; await usersApi.delete(id); fetchUsers(); };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="space-y-6">

      <motion.div variants={fade} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} team members</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </button>
      </motion.div>

      {/* User Cards */}
      <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {users.map(u => {
            const cfg = ROLE_CFG[u.role] || ROLE_CFG.VIEWER;
            const initials = u.username.slice(0, 2).toUpperCase();
            return (
              <motion.div key={u.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-white/8 p-5 relative overflow-hidden group hover:border-white/15 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${cfg.color}10, transparent 60%)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}99)` }}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.username}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{u.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-600'}`}
                      style={{ background: u.status === 'ACTIVE' ? 'rgba(5,150,105,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${u.status === 'ACTIVE' ? 'rgba(5,150,105,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                      {u.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <RoleBadge role={u.role} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => toggleStatus(u)} className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 p-6"
              style={{ background: '#13131f' }}>
              <h3 className="text-lg font-bold text-white mb-5">{editId ? 'Edit User' : 'New User'}</h3>
              {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editId && (
                  <>
                    <FormInput label="Username" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                    <FormInput label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  </>
                )}
                <FormInput label="Email" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ROLE_CFG).map(([r, cfg]) => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className="py-2.5 rounded-xl text-xs font-bold transition-all border"
                        style={form.role === r
                          ? { background: cfg.bg, color: cfg.color, borderColor: cfg.border }
                          : { background: 'rgba(255,255,255,0.03)', color: '#64748b', borderColor: 'rgba(255,255,255,0.08)' }}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/8 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>Cancel</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
