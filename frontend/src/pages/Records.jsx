import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recordsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const EMPTY = { amount: '', type: 'INCOME', category: '', date: '', notes: '' };
const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function Badge({ type }) {
  const isIncome = type === 'INCOME';
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{
        background: isIncome ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)',
        color: isIncome ? '#34d399' : '#f87171',
        border: `1px solid ${isIncome ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'}`,
      }}>
      {isIncome ? '↑' : '↓'} {type}
    </span>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <input {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none border border-white/8 focus:border-violet-500/60 transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

export default function Records() {
  const { can } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, page: 0, totalElements: 0 });
  const [filters, setFilters] = useState({ type: '', category: '', from: '', to: '', page: 0, size: 10 });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await recordsApi.getAll(params);
      setRecords(res.data.content);
      setPagination({ totalPages: res.data.totalPages, page: res.data.page, totalElements: res.data.totalElements });
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal(true); };
  const openEdit = r => { setForm({ amount: r.amount, type: r.type, category: r.category, date: r.date, notes: r.notes || '' }); setEditId(r.id); setError(''); setModal(true); };

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    try {
      editId ? await recordsApi.update(editId, form) : await recordsApi.create(form);
      setModal(false); fetchRecords();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this record?')) return;
    await recordsApi.delete(id); fetchRecords();
  };

  const exportCSV = () => {
    const rows = [['Date','Category','Type','Amount','Notes'], ...records.map(r => [r.date, r.category, r.type, r.amount, r.notes || ''])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `finflow_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filtered = records.filter(r => r.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="space-y-6">

      {/* Header */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Records</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.totalElements} total transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/8 hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          )}
          {can('write') && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Record
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fade} className="flex flex-wrap gap-2">
        {[
          { el: <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value, page: 0 })} className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 outline-none border border-white/8 focus:border-violet-500/60 transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}><option value="">All Types</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select> },
          { el: <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value, page: 0 })} className="px-3 py-2 rounded-xl text-xs text-slate-300 outline-none border border-white/8 focus:border-violet-500/60 transition-colors [color-scheme:dark]" style={{ background: 'rgba(255,255,255,0.04)' }} /> },
          { el: <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value, page: 0 })} className="px-3 py-2 rounded-xl text-xs text-slate-300 outline-none border border-white/8 focus:border-violet-500/60 transition-colors [color-scheme:dark]" style={{ background: 'rgba(255,255,255,0.04)' }} /> },
          { el: <button onClick={() => setFilters({ type: '', category: '', from: '', to: '', page: 0, size: 10 })} className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-white border border-white/8 hover:border-white/20 transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>Clear</button> },
        ].map((f, i) => <div key={i}>{f.el}</div>)}
      </motion.div>

      {/* Table */}
      <motion.div variants={fade} className="rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Transactions</p>
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-2.5 text-slate-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search category..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none border border-white/8 focus:border-violet-500/60 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-600 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Date','Category','Type','Amount','Notes','By', can('write') ? '' : null].filter(h => h !== null).map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-5 py-16 text-center text-slate-600 text-sm">No records found</td></tr>
                  ) : filtered.map(r => (
                    <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors group">
                      <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{r.date}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-200">{r.category}</td>
                      <td className="px-5 py-3.5"><Badge type={r.type} /></td>
                      <td className={`px-5 py-3.5 text-sm font-bold font-mono ${r.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.type === 'INCOME' ? '+' : '-'}₹{Number(r.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[140px] truncate">{r.notes || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{r.createdBy || '—'}</td>
                      {can('write') && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-600">{pagination.totalElements} records</span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => setFilters({ ...filters, page: i })}
                  className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                  style={i === pagination.page
                    ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
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
              <h3 className="text-lg font-bold text-white mb-5">{editId ? 'Edit Record' : 'New Record'}</h3>
              {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  {['INCOME','EXPENSE'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border"
                      style={form.type === t
                        ? { background: t === 'INCOME' ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)', color: t === 'INCOME' ? '#34d399' : '#f87171', borderColor: t === 'INCOME' ? 'rgba(5,150,105,0.4)' : 'rgba(220,38,38,0.4)' }
                        : { background: 'rgba(255,255,255,0.03)', color: '#64748b', borderColor: 'rgba(255,255,255,0.08)' }}>
                      {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
                    </button>
                  ))}
                </div>
                <Input label="Amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                <Input label="Category" type="text" placeholder="e.g. Salary, Rent, Food" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={{ colorScheme: 'dark' }} />
                <Input label="Notes (optional)" type="text" placeholder="Add a note..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/8 hover:border-white/20 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>Cancel</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
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
