import React, { useState, useEffect } from 'react';

function safeEmailKey(email) {
  return email.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const last = localStorage.getItem('cem_last_user');
    if (last) {
      try {
        const parsed = JSON.parse(last);
        setEmail(parsed.email || '');
        setName(parsed.name || '');
      } catch {}
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    const userKey = `cem_user_${safeEmailKey(email)}`;
    const user = { email, name: name || email.split('@')[0] };
    localStorage.setItem(userKey, JSON.stringify(user));
    localStorage.setItem('cem_last_user', JSON.stringify(user));

    // Seed categories if absent
    const catsKey = `cem_cats::${safeEmailKey(email)}`;
    if (!localStorage.getItem(catsKey)) {
      const defaults = ['Food', 'Transport', 'Tools', 'Events', 'Misc'];
      localStorage.setItem(catsKey, JSON.stringify(defaults));
    }

    onLogin(user);
  };

  return (
    <div className="max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-xl p-6 text-white">
      <h2 className="text-xl font-semibold mb-2">Sign in</h2>
      <p className="text-white/70 text-sm mb-6">Use your email to manage club transactions securely on this device.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-black border border-white/20 px-3 py-2 outline-none focus:border-[#5B913B]"
            placeholder="you@club.org"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[#5B913B] hover:bg-[#4a7d33] text-black font-semibold py-2 transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
