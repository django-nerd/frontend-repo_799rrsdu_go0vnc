import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Lightweight SVG Doughnut chart (no external deps)
function Donut({ income = 0, expense = 0 }) {
  const total = Math.max(income + expense, 1);
  const r = 36;
  const c = 2 * Math.PI * r;
  const inc = Math.min(Math.max(income / total, 0), 1);
  const exp = Math.min(Math.max(expense / total, 0), 1);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-48">
      <circle cx="50" cy="50" r={r} stroke="#374151" strokeWidth="12" fill="none" />
      {/* Income arc */}
      <circle cx="50" cy="50" r={r} stroke="#34D399" strokeWidth="12" fill="none" strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - inc)}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
      {/* Expense arc layered on top starting where income ends */}
      <circle cx="50" cy="50" r={r} stroke="#FB7185" strokeWidth="12" fill="none" strokeDasharray={`${c * exp} ${c}`} strokeDashoffset={`${c * (1 - exp)}`} transform={`rotate(${(inc * 360) - 90} 50 50)`} strokeLinecap="round" />
      <text x="50" y="54" textAnchor="middle" className="fill-white/80 text-sm">₹{(income - expense).toFixed(0)}</text>
    </svg>
  );
}

// Lightweight Bar chart
function Bars({ labels = [], income = [], expense = [] }) {
  const maxVal = Math.max(1, ...income, ...expense);
  return (
    <div className="w-full h-56 grid items-end gap-3" style={{ gridTemplateColumns: `repeat(${labels.length || 1}, minmax(0,1fr))` }}>
      {(labels.length ? labels : ['']).map((lab, i) => {
        const incH = (income[i] || 0) / maxVal * 100;
        const expH = (expense[i] || 0) / maxVal * 100;
        return (
          <div key={lab || i} className="flex flex-col items-center gap-2">
            <div className="flex w-full items-end gap-1">
              <div className="flex-1 bg-emerald-500/30" style={{ height: `${incH}%` }} title={`Income: ₹${income[i] || 0}`} />
              <div className="flex-1 bg-rose-500/40" style={{ height: `${expH}%` }} title={`Expense: ₹${expense[i] || 0}`} />
            </div>
            <div className="w-full truncate text-center text-xs text-white/70" title={lab}>{lab || '—'}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ totals, pulse, barData }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="space-y-4">
      <div className="bg-white/5 backdrop-blur rounded-2xl p-4 ring-1 ring-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div animate={pulse.income && !prefersReducedMotion ? { scale: [1, 1.04, 1] } : {}} className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4">
            <div className="text-xs text-emerald-200/80">Total Income</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-300">₹{totals.income.toFixed(2)}</div>
          </motion.div>
          <motion.div animate={pulse.expense && !prefersReducedMotion ? { x: [0, -6, 6, 0] } : {}} className="rounded-xl bg-rose-500/10 ring-1 ring-rose-400/30 p-4">
            <div className="text-xs text-rose-200/80">Total Expense</div>
            <div className="mt-1 text-2xl font-semibold text-rose-300">₹{totals.expense.toFixed(2)}</div>
          </motion.div>
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
            <div className="text-xs text-white/70">Available Balance</div>
            <div className={`mt-1 text-2xl font-semibold ${totals.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>₹{totals.balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="mb-2 text-sm font-medium text-white/90">Income vs Expense</div>
          <Donut income={totals.income} expense={totals.expense} />
          <div className="mt-2 flex gap-6 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-400" />Income: ₹{totals.income.toFixed(2)}</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-400" />Expense: ₹{totals.expense.toFixed(2)}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="mb-2 text-sm font-medium text-white/90">Category-wise Breakdown</div>
          <Bars labels={barData.labels} income={barData.income} expense={barData.expense} />
          <div className="mt-2 text-xs text-white/60">Each pair shows Income (green) vs Expense (red).</div>
        </div>
      </div>
    </section>
  );
}
