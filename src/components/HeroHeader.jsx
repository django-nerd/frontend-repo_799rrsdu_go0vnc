import React from 'react';
import Spline from '@splinetool/react-spline';
import { LogOut, User, Wallet } from 'lucide-react';

export default function HeroHeader({ user, onLogout }) {
  return (
    <header className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 opacity-60">
        {/* Spline 3D hero */}
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Soft gradient overlay for readability; won't block Spline interaction */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

      <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-400/40">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Club Expense Manager</h1>
              <p className="text-xs text-white/70">Built for NxtWave Clubs</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                <User className="h-4 w-4 text-white/80" />
                <span className="text-xs text-white/80">{user.email}</span>
              </div>
              <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">Manage finances with clarity and speed.</h2>
          <p className="mt-3 text-white/75">Track income and expenses, visualize categories, export backups, and stay organized. Managed by Mohith (Financial Head).</p>
        </div>
      </div>
    </header>
  );
}
