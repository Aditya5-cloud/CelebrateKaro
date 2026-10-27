'use client';

import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Hamari Jaipur palace Shaadi bilkul stress-free rahi. Halwai headcount se Mandap floral setup tak, CelebrateKaro ne dono families ko bina kisi misunderstanding ke sync rakha!',
    author: 'Priya & Rohan M.',
    event: 'Jaipur Destination Shaadi',
    scale: '350 Guests',
  },
  {
    quote:
      'Dadaji ke 80th Janamdin par 85 relatives the across 3 generations. The AI checklist reminded us of everything from pandit timings to return gift mithai — zero last-minute panic!',
    author: 'Ananya S.',
    event: 'South Mumbai Milestone Janamdin',
    scale: '85 Guests',
  },
  {
    quote:
      'Annual community Mahaprasad Bhandara organize karna hamesha stressful hota tha. CelebrateKaro ke ration budget envelopes aur volunteer checklists se 1,200 logon ki service bilkul peaceful rahi.',
    author: 'Rajesh K. (Sewa Samiti)',
    event: 'Varanasi Mahaprasad Bhandara',
    scale: '1,200 Guests',
  },
];

export function LovedByHosts() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-[#1E1B4B] via-[#161233] to-[#1E1B4B] text-white overflow-hidden border-b border-amber-500/15">
      {/* Decorative Traditional Paisley / Ring Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="indian-waves" width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q 20 5, 40 20 T 80 20" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#indian-waves)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight font-headline">
            Loved by Over 5,000+ Happy Hosts
          </h2>
          <p className="text-base sm:text-lg text-slate-200 font-body">
            Read what couples, birthday families, aur community samitis say about planning with CelebrateKaro.
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#FAF6EF] rounded-3xl p-8 text-[#1E1B4B] shadow-xl flex flex-col justify-between border border-amber-300/40 hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-body italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-amber-900/10 flex items-center justify-between font-body">
                <div>
                  <h4 className="text-lg font-bold text-[#1E1B4B] font-headline">
                    {t.author}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium">
                    {t.event}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                  {t.scale}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
