import React, { useEffect, useMemo, useState } from 'react';

export default function TransactionForm({ categories = [], editing, onSave, onCancel }) {
  const [model, setModel] = useState({ id: null, date: '', title: '', type: 'expense', category: categories[0] || 'Misc', amount: '', notes: '' });

  useEffect(() => {
    if (editing) {
      setModel({ ...editing, amount: String(editing.amount) });
    } else {
      setModel({ id: null, date: '', title: '', type: 'expense', category: categories[0] || 'Misc', amount: '', notes: '' });
    }
  }, [editing, categories]);

  const canSubmit = useMemo(() => model.title && model.date && Number(model.amount) > 0, [model]);

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const normalized = {
      ...model,
      amount: Number(model.amount),
      // For income: ignore category
      category: model.type === 'income' ? 'Income' : model.category,
    };
    onSave(normalized);
  };

  return (
    <form onSubmit={submit} className="grid md:grid-cols-6 gap-3 bg-[#0b0b0b] border border-white/10 p-4 rounded-xl text-white">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Date</label>
        <input type="date" className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={model.date} onChange={(e)=>setModel(m=>({...m,date:e.target.value}))} required />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Title</label>
        <input type="text" className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={model.title} onChange={(e)=>setModel(m=>({...m,title:e.target.value}))} placeholder="e.g., Venue booking" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Type</label>
        <select className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={model.type} onChange={(e)=>setModel(m=>({...m,type:e.target.value}))}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Amount</label>
        <input type="number" step="0.01" className="w-full rounded-md bg.black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={model.amount} onChange={(e)=>setModel(m=>({...m,amount:e.target.value}))} required />
      </div>

      {model.type !== 'income' && (
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Category</label>
          <select className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={model.category} onChange={(e)=>setModel(m=>({...m,category:e.target.value}))}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      <div className="md:col-span-4">
        <label className="block text-sm mb-1">Notes</label>
        <input type="text" className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" value={model.notes} onChange={(e)=>setModel(m=>({...m,notes:e.target.value}))} placeholder="Optional" />
      </div>

      <div className="md:col-span-2 flex items-end gap-2">
        <button type="submit" disabled={!canSubmit} className="flex-1 rounded-md bg-[#5B913B] hover:bg-[#4a7d33] disabled:opacity-60 text-black font-semibold py-2">{editing ? 'Update' : 'Add'}</button>
        {editing && (
          <button type="button" onClick={onCancel} className="rounded-md bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-2">Cancel</button>
        )}
      </div>
    </form>
  );
}
