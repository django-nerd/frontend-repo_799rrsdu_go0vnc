import React from 'react';

export default function Filters({ filters, categories, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  return (
    <div className="grid md:grid-cols-6 gap-3 bg-[#0b0b0b] border border-white/10 p-4 rounded-xl text-white">
      <div>
        <label className="block text-sm mb-1">From</label>
        <input type="date" className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={filters.from} onChange={(e)=>set('from', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">To</label>
        <input type="date" className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={filters.to} onChange={(e)=>set('to', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">Type</label>
        <select className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={filters.type} onChange={(e)=>set('type', e.target.value)}>
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Category</label>
        <select className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={filters.category} onChange={(e)=>set('category', e.target.value)}>
          <option value="all">All</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Search</label>
        <input type="text" placeholder="Search title or notes" className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={filters.q} onChange={(e)=>set('q', e.target.value)} />
      </div>
    </div>
  );
}
