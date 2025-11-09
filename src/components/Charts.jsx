import React, { useMemo } from 'react';

function formatCurrency(n) {
  return `₹${(n || 0).toLocaleString()}`;
}

function Bar({ x, y, w, h, color, label, value }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={color} />
      {h >= 18 && (
        <text x={x + 6} y={y + 12} fontSize={10} fill="#fff" opacity="0.9">
          {label}
        </text>
      )}
      {h >= 18 && (
        <text x={x + w - 6} y={y + 12} fontSize={10} fill="#fff" opacity="0.8" textAnchor="end">
          {formatCurrency(value)}
        </text>
      )}
    </g>
  );
}

export default function Charts({ items = [] }) {
  const { byCategory, byMonth, maxCat, maxMonth } = useMemo(() => {
    const byCategory = new Map();
    const byMonth = {};
    for (const t of items) {
      const month = (t.date || '').slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { income: 0, expense: 0 };
      byMonth[month][t.type] += Number(t.amount) || 0;
      if (t.type === 'expense') {
        const key = t.category || 'Misc';
        byCategory.set(key, (byCategory.get(key) || 0) + (Number(t.amount) || 0));
      }
    }
    const catArr = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]);
    const monthKeys = Object.keys(byMonth).sort();
    const monthArr = monthKeys.map((k) => ({ key: k, ...byMonth[k] }));
    const maxCat = catArr.length ? Math.max(...catArr.map(([, v]) => v)) : 0;
    const maxMonth = monthArr.length ? Math.max(...monthArr.map((m) => Math.max(m.income, m.expense))) : 0;
    return { byCategory: catArr, byMonth: monthArr, maxCat, maxMonth };
  }, [items]);

  return (
    <section className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Spending by Category</h3>
          <span className="text-xs text-white/60">Expenses</span>
        </div>
        {byCategory.length === 0 ? (
          <p className="text-sm text-white/60">No expense data yet.</p>
        ) : (
          <svg viewBox={`0 0 640 ${Math.max(52, byCategory.length * 32)}`} className="w-full h-auto">
            {byCategory.map(([label, value], i) => {
              const barW = maxCat ? (value / maxCat) * 600 : 0;
              const y = 8 + i * 32;
              return (
                <g key={label}>
                  <Bar x={20} y={y} w={barW} h={20} color="#754E1A" label={label} value={value} />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Monthly Flow</h3>
          <span className="text-xs text-white/60">Income vs Expense</span>
        </div>
        {byMonth.length === 0 ? (
          <p className="text-sm text-white/60">Add some records to see trends by month.</p>
        ) : (
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${Math.max(640, byMonth.length * 80)} 220`} className="w-full h-auto min-w-[640px]">
              {byMonth.map((m, i) => {
                const x = 30 + i * 80;
                const incomeH = maxMonth ? (m.income / maxMonth) * 160 : 0;
                const expenseH = maxMonth ? (m.expense / maxMonth) * 160 : 0;
                return (
                  <g key={m.key} transform={`translate(${x},0)`}>
                    <text x={20} y={200} fontSize={10} fill="#fff" opacity="0.8" textAnchor="middle">{m.key}</text>
                    <rect x={4} y={180 - incomeH} width={16} height={incomeH} rx={3} fill="#5B913B" />
                    <rect x={24} y={180 - expenseH} width={16} height={expenseH} rx={3} fill="#754E1A" />
                  </g>
                );
              })}
              <text x={10} y={12} fontSize={10} fill="#5B913B">Income</text>
              <text x={70} y={12} fontSize={10} fill="#754E1A">Expense</text>
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
