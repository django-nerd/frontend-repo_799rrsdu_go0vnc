import React, { useMemo, useState } from 'react';

export default function CategoryManager({ categories = [], onAdd, onRemove }) {
  const [value, setValue] = useState('');
  const normalized = useMemo(() => value.trim(), [value]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!normalized) return;
    onAdd(normalized);
    setValue('');
  };

  return (
    <section className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Categories</h3>
        <span className="text-xs text-white/60">For expenses</span>
      </div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a custom category"
          className="flex-1 rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]"
        />
        <button type="submit" className="rounded-md bg-[#5B913B] hover:bg-[#4a7d33] text-black font-semibold px-4">Add</button>
      </form>
      {categories.length === 0 ? (
        <p className="text-sm text-white/60">No categories yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm">
              {c}
              <button
                type="button"
                className="text-white/60 hover:text-white"
                onClick={() => onRemove(c)}
                aria-label={`Remove ${c}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
