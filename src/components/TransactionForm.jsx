import React, { useState } from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function TransactionForm({ form, setForm, categories, onSubmit, onClear, onAddCategory, onQuickAdd }) {
  const [newCat, setNewCat] = useState('');

  return (
    <section className="bg-white/5 backdrop-blur rounded-2xl p-4 ring-1 ring-white/10">
      <h2 className="text-lg font-semibold text-white/90">Add / Edit Transaction</h2>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <label className="block text-sm text-white/80">
          Title
          <input className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" placeholder="e.g., Sponsorship from XYZ" value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} />
        </label>
        <div className="flex gap-2">
          <label className="flex-1 text-sm text-white/80">
            Amount (₹)
            <input type="number" className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" value={form.amount} onChange={(e)=>setForm(f=>({...f,amount:e.target.value}))} />
          </label>
          <label className="w-40 text-sm text-white/80">
            Type
            <select value={form.type} onChange={(e)=>setForm(f=>({...f,type:e.target.value}))} className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <label className="flex-1 text-sm text-white/80">
            Category
            <select value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))} className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60">
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="w-44 text-sm text-white/80">
            Date
            <input type="date" value={form.date} onChange={(e)=>setForm(f=>({...f,date:e.target.value}))} className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
          </label>
        </div>
        <label className="block text-sm text-white/80">
          Notes
          <textarea placeholder="Optional notes" value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))} className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 min-h-[80px]" />
        </label>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 font-medium text-black transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300" type="submit">
            <PlusCircle className="h-4 w-4" /> {form.id ? 'Update' : 'Add'}
          </button>
          <button type="button" onClick={onClear} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 transition hover:bg-white/20 focus:outline-none">
            <RefreshCw className="h-4 w-4" /> Clear
          </button>
        </div>
      </form>

      <div className="mt-4 border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white/90">Quick-add</h3>
          <div className="flex gap-2 flex-wrap">
            {['Food','Transport','Tools','Events','Misc'].map(c => (
              <button key={c} onClick={() => onQuickAdd(c)} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 transition" aria-label={`quick add ${c}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newCat} onChange={(e)=>setNewCat(e.target.value)} placeholder="New category" className="flex-1 rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
          <button onClick={()=>{ if (newCat.trim()) { onAddCategory(newCat.trim()); setNewCat(''); } }} className="rounded-lg bg-emerald-500/90 px-3 py-2 text-black">Add</button>
        </div>
      </div>
    </section>
  );
}
