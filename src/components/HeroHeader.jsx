import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroHeader({ user, onLogout }) {
  return (
    <header className="relative w-full h-[320px] md:h-[420px] overflow-hidden bg-[#000000] text-white">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/95" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Club Expense Manager</h1>
            <p className="text-sm md:text-base text-white/80">Built for NxtWave Clubs</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-white/80">Signed in as</p>
                <p className="font-medium">{user.name || user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border border-white/20 bg-[#000000]/50 hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-[#5B913B] text-black">Income</span>
          <span className="inline-flex items-center text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-[#84994F] text-black">Clubs</span>
          <span className="inline-flex items-center text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-[#754E1A] text-white">Expenses</span>
        </div>
      </div>
    </header>
  );
}
