'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function InspoFooter() {
  return (
    <footer className="bg-[#161233] text-white border-t border-white/10 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F59E0B] text-[#1E1B4B] font-black">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-black text-sm tracking-tight text-white">
            CelebrateKaro Studio
          </span>
        </div>

        <p className="text-xs text-amber-200/80">
          &copy; {new Date().getFullYear()} CelebrateKaro. Crafted for joyous Indian celebrations.
        </p>
      </div>
    </footer>
  );
}
