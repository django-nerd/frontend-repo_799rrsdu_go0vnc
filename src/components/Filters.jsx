import React from 'react';

export default function Filters({ categories, filter, setFilter }) {
  return (
    <section className="bg-white/5 backdrop-blur rounded-2xl p-4 ring-1 ring-white/10">
      <h3 className="font-medium text-white/90 mb-3">Filters</h3>
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={filter.from} onChange={(e)=>setFilter(f=>({...f,from:e.target.value}))} className="rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
        <input type="date" value={filter.to} onChange={(e)=>setFilter(f=>({...f,to:e.target.value}))} className="rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
        <select value={filter.category} onChange={(e)=>setFilter(f=>({...f,category:e.target.value}))} className="rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none">
          <option>All</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filter.type} onChange={(e)=>setFilter(f=>({...f,type:e.target.value}))} className="rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none">
          <option>All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input placeholder="Search" value={filter.search} onChange={(e)=>setFilter(f=>({...f,search:e.target.value}))} className="flex-1 min-w-[160px] rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none" />
        <button onClick={()=>setFilter({from:'',to:'',category:'All',type:'All',search:''})} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">Reset</button>
      </div>
    </section>
  );
}
