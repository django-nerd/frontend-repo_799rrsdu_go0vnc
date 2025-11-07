import React, { useEffect, useState } from 'react';
import { Lock, Mail } from 'lucide-react';

// Simple local auth using localStorage. Data is scoped by email key.
// To switch to Firebase/Google OAuth later: replace this component with
// a provider-based sign-in and store a stable userId. Keep storage keys
// prefixed by that userId for per-user separation.

export default function Auth({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const last = localStorage.getItem('cem_last_user');
    if (last) setEmail(last);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    // Minimal email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    // Store hashed-ish password (not secure, demo only). In production use proper auth.
    const userKey = `cem_user_${email}`;
    const existing = localStorage.getItem(userKey);
    const record = { email, passwordHash: btoa(password) };
    if (!existing) {
      localStorage.setItem(userKey, JSON.stringify(record));
    } else {
      const parsed = JSON.parse(existing);
      if (parsed.passwordHash !== btoa(password)) {
        setError('Incorrect password');
        return;
      }
    }
    localStorage.setItem('cem_last_user', email);
    onAuthenticated({ email, userKey });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
        <div className="flex items-center gap-2 text-white/80">
          <Lock className="h-5 w-5" />
          <h3 className="text-lg font-medium">Sign in</h3>
        </div>
        <p className="mt-1 text-sm text-white/60">Local-only authentication. Data stays in your browser.</p>
        <div className="mt-5 space-y-4">
          <label className="block text-sm text-white/80">
            Email
            <div className="mt-1 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus-within:ring-emerald-400/60">
              <Mail className="h-4 w-4 text-white/50" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="you@college.edu" />
            </div>
          </label>
          <label className="block text-sm text-white/80">
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" placeholder="••••••••" />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button type="submit" className="mt-5 w-full rounded-lg bg-emerald-500/90 px-4 py-2 font-medium text-black transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">Continue</button>
        <p className="mt-3 text-xs text-white/60">
          Tip: To switch to Google/Firebase later, replace this form with a provider button and map the returned user id to the storage prefix (cem_user_{'{'}userId{'}'}).
        </p>
      </form>
    </div>
  );
}
