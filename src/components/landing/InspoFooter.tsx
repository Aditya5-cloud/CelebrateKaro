'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function InspoFooter() {
  return (
    <footer className="bg-[#073330] text-white border-t border-white/10 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Links Columns (Matching Inspo) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14 text-xs sm:text-sm">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#00e599] mb-4 text-[11px]">
              Planning Studio
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              <li><span className="hover:text-white transition-colors cursor-pointer">Milestone Roadmaps</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Budget Envelopes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Vendor Rolodex & CRM</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Run-of-Show Timeline</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">AI Event Concierge</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#00e599] mb-4 text-[11px]">
              Archetypes
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              <li><span className="hover:text-white transition-colors cursor-pointer">Weddings & Receptions</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Milestone Birthdays</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Charity Galas & Dinners</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Festivals & Socials</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Anniversary Celebrations</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#00e599] mb-4 text-[11px]">
              Resources
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              <li><span className="hover:text-white transition-colors cursor-pointer">Per-Guest Cost Guide</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Batch Cocktail Calculator</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Vendor Contract Checklist</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Seating Arrangement Tips</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#00e599] mb-4 text-[11px]">
              Support & Company
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Host Community</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Contact Support</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy & Terms</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Logo & Copyright (Matching Inspo) */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>
    </footer>
  );
}
