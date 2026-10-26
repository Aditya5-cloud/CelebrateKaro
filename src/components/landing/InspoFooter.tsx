'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function InspoFooter() {
  return (
    <footer className="bg-[#073330] text-white border-t border-white/10 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e599] text-[#073330] font-black">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-black text-sm tracking-tight text-white">
            CelebratePro Studio
          </span>
        </div>

        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CelebratePro. Crafted for serene celebrations.
        </p>
      </div>
    </footer>
  );
}
