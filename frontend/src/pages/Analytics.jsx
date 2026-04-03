import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { dashboardApi } from '../api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2'];
const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 px-4 py-3 text-sm" style={{ background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(12px)' }}>
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

function MetricTile({ label, value, color, sub }) {
  return (
    <div className="p-4 rounded-2xl border border-white/8 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="absolute inset-0 opacity-30 rounded-2xl" style={{ background: `radial-gradient(circle at 100% 0%, ${color}20, transparent 60%)` }} />
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);

  useEffect(() => { dashboardApi.getSummary().then(r => setSummary(r.data)); }, []);

  if (!summary) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 rounded-2xl shimmer" />)}
    </div>
  );

  const income   = Number(summary.totalIncome   || 0);
  const expenses = Number(summary.totalExpenses  || 0);
  const balance  = Number(summary.netBalance     || 0);

  const expCats = Object.entries(summary.expenseByCategory || {}).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value);
  const incCats = Object.entries(summary.incomeByCategory  || {}).map(([name, value]) => ({ name, value: Number(value) }));
  const topExp  = expCats[0];
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  const monthlyData = (summary.monthlyTrends || []).map(t => ({
    name: MONTHS[t.month - 1],
    Income: Number(t.income),
    Expenses: Number(t.expenses),
    Net: Number(t.income) - Number(t.expenses),
  }));

  const months = monthlyData;
  const lastTwo = months.slice(-2);
  const trend = lastTwo.length === 2
    ? { pct: Math.abs((((lastTwo[1].Expenses - lastTwo[0].Expenses) / (lastTwo[0].Expenses || 1)) * 100)).toFixed(1), up: lastTwo[1].Expenses > lastTwo[0].Expenses }
    : null;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="space-y-6">

      <motion.div variants={fade}>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Deep dive into your financial patterns</p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={fade} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile label="Net Balance"    value={`₹${balance.toLocaleString('en-IN')}`}  color={balance >= 0 ? '#7c3aed' : '#dc2626'} sub="All time" />
        <MetricTile label="Savings Rate"   value={`${savingsRate}%`}               color={savingsRate >= 20 ? '#059669' : savingsRate >= 0 ? '#d97706' : '#dc2626'} sub="of income saved" />
        <MetricTile label="Income Sources" value={incCats.length}                  color="#2563eb" sub="categories" />
        <MetricTile label="Expense Types"  value={expCats.length}                  color="#d97706" sub="categories" />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar Chart */}
        <motion.div variants={fade} className="lg:col-span-3 rounded-2xl border border-white/8 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-white">Monthly Breakdown</p>
            <span className="text-[10px] text-slate-600 border border-white/8 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '16px' }} />
              <Bar dataKey="Income"   fill="#059669" radius={[4,4,0,0]} maxBarSize={32} />
              <Bar dataKey="Expenses" fill="#dc2626" radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div variants={fade} className="lg:col-span-2 rounded-2xl border border-white/8 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-sm font-semibold text-white mb-4">Expense Categories</p>
          {expCats.length > 0 ? (
            <div className="space-y-3">
              {expCats.map((c, i) => {
                const pct = Math.round((c.value / expenses) * 100);
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                        <span className="text-xs text-slate-400">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">₹{c.value.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-600 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No expense data</div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Net trend */}
        <motion.div variants={fade} className="rounded-2xl border border-white/8 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-sm font-semibold text-white mb-4">Net Balance Trend</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="Net" radius={[4,4,0,0]} maxBarSize={28}>
                {monthlyData.map((d, i) => <Cell key={i} fill={d.Net >= 0 ? '#7c3aed' : '#dc2626'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Income donut */}
        <motion.div variants={fade} className="rounded-2xl border border-white/8 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-sm font-semibold text-white mb-4">Income Sources</p>
          {incCats.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={incCats} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={3} stroke="none">
                    {incCats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {incCats.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[70px]">{c.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300">₹{c.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-slate-600 text-sm">No income data</div>
          )}
        </motion.div>

        {/* Summary stats */}
        <motion.div variants={fade} className="rounded-2xl border border-white/8 p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-sm font-semibold text-white">Summary</p>
          {[
            { label: 'Total Income',   value: `₹${income.toLocaleString('en-IN')}`,   color: '#059669' },
            { label: 'Total Expenses', value: `₹${expenses.toLocaleString('en-IN')}`, color: '#dc2626' },
            { label: 'Net Balance',    value: `₹${balance.toLocaleString('en-IN')}`,  color: balance >= 0 ? '#7c3aed' : '#dc2626' },
            { label: 'Top Expense',    value: topExp?.name || '—',             color: '#d97706' },
            { label: 'Monthly Trend',  value: trend ? `${trend.up ? '↑' : '↓'} ${trend.pct}%` : '—', color: trend?.up ? '#dc2626' : '#059669' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between border-b border-white/4 pb-3 last:border-0 last:pb-0">
              <span className="text-xs text-slate-600">{s.label}</span>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
