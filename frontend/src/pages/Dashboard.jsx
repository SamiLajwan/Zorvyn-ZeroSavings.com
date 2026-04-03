import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardApi } from '../api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2'];

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

function GlassCard({ children, className = '', glow = false }) {
  return (
    <motion.div variants={fade}
      className={`rounded-2xl border border-white/8 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        boxShadow: glow ? '0 0 40px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
      {children}
    </motion.div>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <GlassCard className="p-5 relative overflow-hidden group hover:border-white/15 transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at 80% 20%, ${color}15, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </GlassCard>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 px-4 py-3 text-sm"
      style={{ background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(12px)' }}>
      <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }}></span>
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">₹{Number(p.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getSummary().then(r => setSummary(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl shimmer" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl shimmer" />
        <div className="h-72 rounded-2xl shimmer" />
      </div>
    </div>
  );

  const income   = Number(summary?.totalIncome   || 0);
  const expenses = Number(summary?.totalExpenses  || 0);
  const balance  = Number(summary?.netBalance     || 0);

  const expCats = Object.entries(summary?.expenseByCategory || {}).map(([name, value]) => ({ name, value: Number(value) }));
  const topCat  = [...expCats].sort((a, b) => b.value - a.value)[0];
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  const monthlyData = (summary?.monthlyTrends || []).map(t => ({
    name: MONTHS[t.month - 1],
    Income: Number(t.income),
    Expenses: Number(t.expenses),
  }));

  const aiNote = (() => {
    if (!topCat || expenses === 0) return 'Start adding records to unlock spending insights.';
    const pct = Math.round((topCat.value / expenses) * 100);
    if (savingsRate < 0) return `You're spending more than you earn. Cut back on ${topCat.name} (${pct}% of expenses) to get back on track.`;
    if (pct >= 40) return `${topCat.name} dominates ${pct}% of your expenses. Consider reviewing this category.`;
    return `Good balance! Saving ${savingsRate}% of income. ${topCat.name} is your top expense at ${pct}%.`;
  })();

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={fade} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your financial snapshot</p>
        </div>
        <div className="text-xs text-slate-500 border border-white/8 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Net Balance" value={`₹${balance.toLocaleString('en-IN')}`}
          sub={`${savingsRate >= 0 ? '+' : ''}${savingsRate}% savings rate`}
          color={balance >= 0 ? '#7c3aed' : '#dc2626'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} />
        <StatCard label="Total Income" value={`₹${income.toLocaleString('en-IN')}`}
          sub={`${Object.keys(summary?.incomeByCategory || {}).length} income sources`}
          color="#059669"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
        <StatCard label="Total Expenses" value={`₹${expenses.toLocaleString('en-IN')}`}
          sub={topCat ? `Top: ${topCat.name}` : 'No expenses yet'}
          color="#dc2626"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>} />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-white">Income vs Expenses</p>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border border-white/8 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}>6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="Income" stroke="#059669" strokeWidth={2} fill="url(#gIncome)" dot={false} activeDot={{ r: 4, fill: '#059669', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} fill="url(#gExpenses)" dot={false} activeDot={{ r: 4, fill: '#dc2626', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[{ label: 'Income', color: '#059669' }, { label: 'Expenses', color: '#dc2626' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full" style={{ background: l.color }}></span>
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Donut Chart */}
        <GlassCard className="p-5">
          <p className="text-sm font-semibold text-white mb-5">Expense Split</p>
          {expCats.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={expCats} dataKey="value" innerRadius={52} outerRadius={75} paddingAngle={3} stroke="none">
                      {expCats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {expCats.slice(0, 4).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                      <span className="text-xs text-slate-400 truncate max-w-[90px]">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300">₹{c.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No expense data</div>
          )}
        </GlassCard>
      </div>

      {/* AI Insight + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* AI Card */}
        <GlassCard className="p-5 relative overflow-hidden" glow>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">AI Insight</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{aiNote}</p>
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Savings Rate</p>
                <p className={`text-lg font-bold ${savingsRate >= 0 ? 'text-violet-400' : 'text-red-400'}`}>{savingsRate}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Top Category</p>
                <p className="text-lg font-bold text-white truncate">{topCat?.name || '—'}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Recent Activity</p>
            <span className="text-[10px] text-slate-500">Latest 10</span>
          </div>
          <div className="divide-y divide-white/4">
            {(summary?.recentActivity || []).slice(0, 6).map(r => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: r.type === 'INCOME' ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={r.type === 'INCOME' ? '#059669' : '#dc2626'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {r.type === 'INCOME'
                        ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
                        : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{r.category}</p>
                    <p className="text-[11px] text-slate-600">{r.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${r.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.type === 'INCOME' ? '+' : '-'}₹{Number(r.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            {!summary?.recentActivity?.length && (
              <div className="px-5 py-12 text-center text-slate-600 text-sm">No activity yet</div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
