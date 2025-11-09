import React, { useEffect, useMemo, useState } from 'react';
import HeroHeader from './components/HeroHeader';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Filters from './components/Filters';
import TransactionsTable from './components/TransactionsTable';

function safeEmailKey(email) { return email.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase(); }
function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['Food', 'Transport', 'Tools', 'Events', 'Misc']);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', type: 'all', category: 'all', q: '' });

  const emailKey = user ? safeEmailKey(user.email) : null;
  const txKey = user ? `cem_expenses::${emailKey}` : null;
  const catsKey = user ? `cem_cats::${emailKey}` : null;

  useEffect(() => {
    const last = load('cem_last_user', null);
    if (last) {
      const key = `cem_user_${safeEmailKey(last.email)}`;
      const u = load(key, null);
      if (u) setUser(u);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setItems(load(txKey, []));
    setCategories(load(catsKey, ['Food', 'Transport', 'Tools', 'Events', 'Misc']));
  }, [user]);

  const onSaveTx = (model) => {
    let next = [...items];
    if (!model.id) {
      next.push({ ...model, id: crypto.randomUUID(), email: user.email });
    } else {
      next = next.map((it) => it.id === model.id ? { ...it, ...model } : it);
    }
    // Category merging for expenses only
    if (model.type !== 'income' && model.category && !categories.includes(model.category)) {
      const nextCats = [...categories, model.category];
      setCategories(nextCats);
      save(catsKey, nextCats);
    }
    setItems(next);
    save(txKey, next);
    setEditing(null);
  };

  const onEdit = (it) => setEditing(it);
  const onDelete = (id) => {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    save(txKey, next);
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filters.type !== 'all' && it.type !== filters.type) return false;
      if (filters.category !== 'all' && it.type !== 'income' && it.category !== filters.category) return false;
      if (filters.from && it.date < filters.from) return false;
      if (filters.to && it.date > filters.to) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!(it.title?.toLowerCase().includes(q) || (it.notes || '').toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [items, filters]);

  const handleLogout = () => setUser(null);

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <HeroHeader user={user} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {!user ? (
          <Auth onLogin={setUser} />
        ) : (
          <>
            <Dashboard expenses={items} />
            <Filters filters={filters} categories={categories} onChange={setFilters} />
            <TransactionForm categories={categories} editing={editing} onSave={onSaveTx} onCancel={() => setEditing(null)} />
            <TransactionsTable items={filtered} onEdit={onEdit} onDelete={onDelete} />
          </>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/70">
        Built for NxtWave Clubs · Modern dark theme · Palette: #000000, #84994F, #754E1A, #5B913B, #FFFFFF
      </footer>
    </div>
  );
}
