'use client';

import React from 'react';

export function InspoFooter() {
  return (
    <footer className="bg-[#161233] text-white border-t border-white/10 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="CelebrateKaro Logo"
            className="h-7 w-7 rounded-lg object-contain shadow-xs border border-amber-400/30 shrink-0"
          />
          <span className="font-bold text-base tracking-tight text-white font-headline">
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
