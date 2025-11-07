import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import HeroHeader from './components/HeroHeader.jsx';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionsTable from './components/TransactionsTable.jsx';
import Filters from './components/Filters.jsx';

// Club Expense Manager — Dark themed, local-first, single-page app
export default function App() {
  // ---------- AUTH ----------
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const last = localStorage.getItem('cem_last_user');
      if (!last) return null;
      const record = localStorage.getItem(`cem_user_${last}`);
      return record ? JSON.parse(record) : null;
    } catch {
      return null;
    }
  });

  const prefersReducedMotion = useReducedMotion();

  const userKeyPrefix = currentUser ? `${currentUser.email}` : null;
  const storageKey = currentUser ? `cem_expenses::${userKeyPrefix}` : null;
  const catKey = currentUser ? `cem_cats::${userKeyPrefix}` : null;

  const safeEmail = currentUser?.email
    ? currentUser.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    : 'anonymous';

  // ---------- DATA ----------
  const defaultCats = ['Food', 'Transport', 'Tools', 'Events', 'Misc'];
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(defaultCats);
  const [form, setForm] = useState({ id: null, title: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [filter, setFilter] = useState({ from: '', to: '', category: 'All', type: 'All', search: '' });

  // Load per-user data
  useEffect(() => {
    if (!currentUser) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setExpenses(raw ? JSON.parse(raw) : []);
      const rawc = localStorage.getItem(catKey);
      setCategories(rawc ? JSON.parse(rawc) : defaultCats);
    } catch {
      setExpenses([]);
      setCategories(defaultCats);
    }
  }, [currentUser, storageKey, catKey]);

  // Persist per-user data
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(storageKey, JSON.stringify(expenses));
  }, [expenses, storageKey, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(catKey, JSON.stringify(categories));
  }, [categories, catKey, currentUser]);

  // ---------- DERIVED ----------
  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        if (filter.category !== 'All' && e.category !== filter.category) return false;
        if (filter.type !== 'All' && e.type !== filter.type) return false;
        if (filter.from && e.date < filter.from) return false;
        if (filter.to && e.date > filter.to) return false;
        if (filter.search && !(`${e.title} ${e.notes || ''}`.toLowerCase().includes(filter.search.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filter]);

  const totals = useMemo(() => {
    let income = 0,
      expense = 0;
    for (const e of filtered) {
      if (e.type === 'income') income += Number(e.amount || 0);
      else expense += Number(e.amount || 0);
    }
    return { income, expense, balance: income - expense };
  }, [filtered]);

  // Category-wise arrays for Dashboard Bars
  const barData = useMemo(() => {
    const labels = Array.from(new Set(filtered.map((f) => f.category).filter(Boolean)));
    const income = labels.map((l) => filtered.filter((x) => x.category === l && x.type === 'income').reduce((s, a) => s + Number(a.amount), 0));
    const expense = labels.map((l) => filtered.filter((x) => x.category === l && x.type === 'expense').reduce((s, a) => s + Number(a.amount), 0));
    return { labels, income, expense };
  }, [filtered]);

  // ---------- ANIM TRIGGERS ----------
  const lastTotals = useRef({ income: 0, expense: 0 });
  const [pulse, setPulse] = useState({ income: false, expense: false });
  useEffect(() => {
    if (!currentUser) return;
    if (totals.income > lastTotals.current.income) {
      setPulse((p) => ({ ...p, income: true }));
      setTimeout(() => setPulse((p) => ({ ...p, income: false })), 800);
    }
    if (totals.expense > lastTotals.current.expense) {
      setPulse((p) => ({ ...p, expense: true }));
      setTimeout(() => setPulse((p) => ({ ...p, expense: false })), 800);
    }
    lastTotals.current = { income: totals.income, expense: totals.expense };
  }, [totals, currentUser]);

  // ---------- TOASTS ----------
  const [toasts, setToasts] = useState([]);
  function toast(message, type = 'info') {
    const id = Date.now().toString() + Math.random();
    setToasts((t) => [{ id, message, type }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  // ---------- CRUD ----------
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.amount) {
      toast('Enter title & amount', 'error');
      return;
    }
    const payload = { ...form, amount: Number(form.amount) };
    if (form.id) setExpenses((s) => s.map((x) => (x.id === form.id ? payload : x)));
    else {
      payload.id = Date.now().toString();
      setExpenses((s) => [payload, ...s]);
    }
    setForm({ id: null, title: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    toast('Saved', 'success');
  }
  function editExpense(exp) {
    setForm({ ...exp });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function deleteExpense(id) {
    if (!confirm('Delete entry?')) return;
    setExpenses((s) => s.filter((x) => x.id !== id));
    toast('Deleted', 'info');
  }
  function addCategory(n) {
    if (!n) return;
    if (categories.includes(n)) return;
    setCategories([n, ...categories]);
    toast('Category added', 'success');
  }
  function quickAdd(cat) {
    setForm((f) => ({ ...f, category: cat }));
  }

  // ---------- EXPORT / IMPORT (scoped by email) ----------
  function downloadCSV() {
    if (!currentUser) {
      toast('Sign in to export', 'error');
      return;
    }
    if (!expenses.length) {
      toast('No data', 'error');
      return;
    }
    const header = ['email', 'id', 'date', 'title', 'type', 'category', 'amount', 'notes'];
    const rows = expenses.map((r) => [
      JSON.stringify(currentUser.email),
      JSON.stringify(r.id ?? ''),
      JSON.stringify(r.date ?? ''),
      JSON.stringify(r.title ?? ''),
      JSON.stringify(r.type ?? ''),
      JSON.stringify(r.category ?? ''),
      JSON.stringify(r.amount ?? ''),
      JSON.stringify(r.notes ?? ''),
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const b = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cem_${safeEmail}_transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function backupJSON() {
    if (!currentUser) {
      toast('Sign in to backup', 'error');
      return;
    }
    const payload = {
      owner_email: currentUser.email,
      exported_at: new Date().toISOString(),
      categories,
      expenses,
    };
    const b = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cem_backup_${safeEmail}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function importJSON(file) {
    if (!currentUser) {
      toast('Sign in to import', 'error');
      return;
    }
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        if (obj.owner_email && obj.owner_email !== currentUser.email) {
          const proceed = window.confirm(`Backup belongs to ${obj.owner_email}. Import into ${currentUser.email}?`);
          if (!proceed) return;
        }
        if (Array.isArray(obj.expenses)) setExpenses(obj.expenses);
        if (Array.isArray(obj.categories)) setCategories(obj.categories);
        toast('Import successful', 'success');
      } catch {
        toast('Invalid JSON', 'error');
      }
    };
    r.readAsText(file);
  }

  // ---------- ONLINE STATUS ----------
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroHeader user={currentUser} onLogout={() => { setCurrentUser(null); }} />

      {!currentUser ? (
        <Auth onAuthenticated={(u) => setCurrentUser(u)} />
      ) : (
        <main className="relative mx-auto max-w-6xl px-4 -mt-16 pb-16">
          {/* Online indicator */}
          <div className="mb-3 flex justify-end">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${online ? 'bg-emerald-500/10 ring-emerald-400/40 text-emerald-200' : 'bg-rose-500/10 ring-rose-400/40 text-rose-200'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TransactionForm
                form={form}
                setForm={setForm}
                categories={categories}
                onSubmit={handleSubmit}
                onClear={() => setForm({ id: null, title: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10), notes: '' })}
                onAddCategory={addCategory}
                onQuickAdd={quickAdd}
              />

              <section className="mt-4 bg-white/5 backdrop-blur rounded-2xl p-4 ring-1 ring-white/10 text-sm">
                <div className="font-medium text-white/90 mb-2">Export / Backup / Restore</div>
                <button onClick={downloadCSV} className="w-full mb-2 rounded-lg bg-blue-500/90 px-3 py-2 text-black hover:bg-blue-400">Download CSV</button>
                <button onClick={backupJSON} className="w-full mb-2 rounded-lg bg-yellow-300/90 px-3 py-2 text-black hover:bg-yellow-300">Backup JSON</button>
                <label className="block cursor-pointer">
                  <input type="file" accept="application/json" onChange={(e) => e.target.files && e.target.files[0] && importJSON(e.target.files[0])} className="hidden" />
                  <span className="inline-block w-full text-center rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/20 hover:bg-white/20">Import JSON</span>
                </label>
                <p className="mt-2 text-xs text-white/60">Local-first: your data stays in this browser profile, scoped per signed-in user. Export and backup files are named with your email to avoid mix-ups.</p>
              </section>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Dashboard totals={totals} pulse={!prefersReducedMotion ? pulse : { income: false, expense: false }} barData={barData} />

              <Filters categories={categories} filter={filter} setFilter={setFilter} />

              <TransactionsTable items={filtered} onEdit={editExpense} onDelete={deleteExpense} />
            </div>
          </div>

          <footer className="mt-8 text-center text-white/60 text-sm">Built for NxtWave GenAI Club · Managed by Mohith</footer>
        </main>
      )}

      {/* Toasts */}
      <div aria-live="polite" className="fixed right-4 bottom-6 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={`pointer-events-auto rounded-xl px-3 py-2 shadow-lg ${t.type === 'error' ? 'bg-rose-600/90' : t.type === 'success' ? 'bg-emerald-600/90' : 'bg-indigo-600/90'}`}
            >
              <div className="text-sm">{t.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
