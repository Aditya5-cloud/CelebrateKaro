'use client';

import React from 'react';

export function InspoFooter() {
  return (
    <footer className="bg-[#FFF3C7] text-[#2A0E1C] border-t-2 border-[#FEC7B4] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="CelebrateKaro Logo"
            className="h-8 w-8 rounded-none object-contain shadow-xs border border-[#F7418F] shrink-0"
          />
          <span className="font-bold text-base tracking-tight text-[#2A0E1C] font-headline">
            CelebrateKaro Studio
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-none bg-[#F7418F] text-white">
            AI Platform
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#2A0E1C]/80 text-center sm:text-right">
          &copy; {new Date().getFullYear()} CelebrateKaro. All rights reserved. Crafted for effortless celebrations.
        </p>
      </div>
    </footer>
  );
}
