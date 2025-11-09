import React, { useMemo } from 'react';

function sum(list) {
  return list.reduce((a, b) => a + (Number(b.amount) || 0), 0);
}

export default function Dashboard({ expenses = [] }) {
  const { incomeTotal, expenseTotal, net } = useMemo(() => {
    const income = expenses.filter((t) => t.type === 'income');
    const out = expenses.filter((t) => t.type === 'expense');
    const incomeTotal = sum(income);
    const expenseTotal = sum(out);
    return { incomeTotal, expenseTotal, net: incomeTotal - expenseTotal };
  }, [expenses]);

  return (
    <section className="grid md:grid-cols-3 gap-4">
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
        <p className="text-sm text-white/70">Income</p>
        <p className="text-2xl font-bold">₹{incomeTotal.toLocaleString()}</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-[#5B913B]" style={{ width: `${Math.min(100, (incomeTotal || 0) / (incomeTotal + expenseTotal || 1) * 100)}%` }} />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
        <p className="text-sm text-white/70">Expenses</p>
        <p className="text-2xl font-bold">₹{expenseTotal.toLocaleString()}</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-[#754E1A]" style={{ width: `${Math.min(100, (expenseTotal || 0) / (incomeTotal + expenseTotal || 1) * 100)}%` }} />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
        <p className="text-sm text-white/70">Net</p>
        <p className={`text-2xl font-bold ${net >= 0 ? 'text-[#5B913B]' : 'text-[#754E1A]'}`}>₹{net.toLocaleString()}</p>
        <p className="text-xs text-white/60 mt-1">Income - Expenses</p>
      </div>
    </section>
  );
}
