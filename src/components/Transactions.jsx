import React, { useMemo, useState } from 'react';

function safeEmailKey(email) {
  return email.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', inQuotes = false, row = [];
  while (i <= text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      if (c === undefined) { rows.push([...row, field]); break; }
      field += c; i++; continue;
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',' || c === undefined) { row.push(field); field = ''; if (c === undefined) rows.push(row); i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field=''; i++; continue; }
      field += c; i++;
    }
  }
  return rows;
}

export default function Transactions({ user, onDataChange }) {
  const emailKey = user ? safeEmailKey(user.email) : null;
  const txKey = `cem_expenses::${emailKey}`;
  const catsKey = `cem_cats::${emailKey}`;

  const [refresh, setRefresh] = useState(0);

  const { items, categories } = useMemo(() => {
    if (!user) return { items: [], categories: [] };
    return {
      items: load(txKey, []),
      categories: load(catsKey, ['Food', 'Transport', 'Tools', 'Events', 'Misc'])
    };
  }, [user, refresh]);

  const [form, setForm] = useState({ id: null, date: '', title: '', type: 'expense', category: 'Misc', amount: '', notes: '' });

  const resetForm = () => setForm({ id: null, date: '', title: '', type: 'expense', category: 'Misc', amount: '', notes: '' });

  const upsert = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.amount || !form.type) return;

    // For income: take only title not category (force category to 'Income')
    const normalized = {
      ...form,
      category: form.type === 'income' ? 'Income' : form.category
    };

    let next = [...items];
    if (form.id == null) {
      next.push({ ...normalized, id: crypto.randomUUID(), email: user.email, amount: Number(normalized.amount) });
    } else {
      next = next.map((it) => it.id === form.id ? { ...it, ...normalized, amount: Number(normalized.amount) } : it);
    }
    save(txKey, next);
    setRefresh((x) => x + 1);
    resetForm();
    onDataChange?.(next);
  };

  const editItem = (item) => {
    setForm({ ...item, amount: String(item.amount) });
  };

  const delItem = (id) => {
    const next = items.filter((it) => it.id !== id);
    save(txKey, next);
    setRefresh((x) => x + 1);
    onDataChange?.(next);
  };

  const exportCSV = () => {
    const header = ['email','id','date','title','type','category','amount','notes'];
    const lines = [header.join(',')];
    for (const it of items) {
      lines.push([
        csvEscape(user.email),
        csvEscape(it.id),
        csvEscape(it.date),
        csvEscape(it.title),
        csvEscape(it.type),
        csvEscape(it.category),
        csvEscape(it.amount),
        csvEscape(it.notes || '')
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const safe = safeEmailKey(user.email);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cem_${safe}_transactions.csv`;
    a.click();
  };

  const exportJSON = () => {
    const payload = {
      owner_email: user.email,
      exported_at: new Date().toISOString(),
      categories,
      expenses: items
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const safe = safeEmailKey(user.email);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cem_backup_${safe}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importJSON = async (file, mode='merge') => {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.owner_email && data.owner_email !== user.email) {
      if (!confirm('Owner email mismatch. Import anyway?')) return;
    }
    let nextCats = [...categories];
    let nextItems = [...items];
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) if (!nextCats.includes(c)) nextCats.push(c);
    }
    if (Array.isArray(data.expenses)) {
      if (mode === 'replace') nextItems = [];
      const byId = new Map(nextItems.map(i => [i.id, i]));
      for (const it of data.expenses) {
        if (mode === 'merge' && byId.has(it.id)) continue;
        if (it.email && it.email !== user.email) continue;
        byId.set(it.id || crypto.randomUUID(), { ...it, id: it.id || crypto.randomUUID() });
      }
      nextItems = Array.from(byId.values());
    }
    save(catsKey, nextCats);
    save(txKey, nextItems);
    setRefresh((x) => x + 1);
    onDataChange?.(nextItems);
  };

  const importCSV = async (file, mode='merge') => {
    const text = await file.text();
    const rows = parseCSV(text).filter(r => r.length > 1);
    const header = rows.shift().map(h => h.trim().toLowerCase());
    const idx = Object.fromEntries(header.map((h, i) => [h, i]));

    let nextCats = [...categories];
    let nextItems = mode === 'replace' ? [] : [...items];
    const byId = new Map(nextItems.map(i => [i.id, i]));

    for (const r of rows) {
      const record = {
        email: r[idx.email] || user.email,
        id: r[idx.id] || crypto.randomUUID(),
        date: r[idx.date] || '',
        title: r[idx.title] || '',
        type: (r[idx.type] || 'expense').toLowerCase(),
        category: r[idx.category] || '',
        amount: Number(r[idx.amount] || 0),
        notes: r[idx.notes] || ''
      };
      if (record.email !== user.email) continue; // scope to current user

      // Income should ignore category
      if (record.type === 'income') record.category = 'Income';

      if (record.category && !nextCats.includes(record.category)) nextCats.push(record.category);
      if (mode === 'merge' && byId.has(record.id)) continue;
      byId.set(record.id, record);
    }

    nextItems = Array.from(byId.values());
    save(catsKey, nextCats);
    save(txKey, nextItems);
    setRefresh((x) => x + 1);
    onDataChange?.(nextItems);
  };

  return (
    <section className="space-y-6">
      <form onSubmit={upsert} className="grid md:grid-cols-6 gap-3 bg-[#0a0a0a] border border-white/10 p-4 rounded-xl text-white">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Date</label>
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Title</label>
          <input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" placeholder="e.g., Sponsorship" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input type="number" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" placeholder="0.00" required />
        </div>

        {/* Category is hidden/disabled for income per requirement */}
        {form.type !== 'income' && (
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Category</label>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-4">
          <label className="block text-sm mb-1">Notes</label>
          <input type="text" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]" placeholder="Optional" />
        </div>

        <div className="md:col-span-2 flex items-end">
          <button type="submit" className="w-full rounded-md bg-[#5B913B] hover:bg-[#4a7d33] text-black font-semibold py-2">Save</button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <button onClick={exportCSV} className="rounded-md bg-[#84994F] text-black px-3 py-2 text-sm hover:opacity-90">Export CSV</button>
        <button onClick={exportJSON} className="rounded-md bg-[#754E1A] text-white px-3 py-2 text-sm hover:opacity-90">Export JSON</button>
        <label className="cursor-pointer rounded-md bg-white text-black px-3 py-2 text-sm hover:opacity-90">
          Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) importJSON(f,'merge'); e.target.value='';}} />
        </label>
        <label className="cursor-pointer rounded-md bg-white text-black px-3 py-2 text-sm hover:opacity-90">
          Import CSV
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) importCSV(f,'merge'); e.target.value='';}} />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-[#111]">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Notes</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-white/60">No records yet</td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="odd:bg-[#0b0b0b] even:bg-[#0e0e0e]">
                <td className="px-4 py-3 whitespace-nowrap">{it.date}</td>
                <td className="px-4 py-3">{it.title}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded text-xs ${it.type === 'income' ? 'bg-[#5B913B] text-black' : 'bg-[#754E1A] text-white'}`}>
                    {it.type}
                  </span>
                </td>
                <td className="px-4 py-3">{it.type === 'income' ? '-' : it.category}</td>
                <td className="px-4 py-3">₹{Number(it.amount).toLocaleString()}</td>
                <td className="px-4 py-3">{it.notes}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => editItem(it)} className="px-2 py-1 rounded bg-[#84994F] text-black text-xs">Edit</button>
                    <button onClick={() => delItem(it.id)} className="px-2 py-1 rounded bg-[#B03030] text-white text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
