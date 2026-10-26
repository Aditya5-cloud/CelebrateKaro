'use client';

import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Our Amalfi wedding was completely stress-free thanks to the category envelopes. We knew down to the dollar what was committed without a single spreadsheet formula breaking!',
    author: 'Elena & Marcus S.',
    event: 'Amalfi Coastal Wedding',
    scale: '120 Guests',
  },
  {
    quote:
      'Planning my 30th rooftop party was actually fun for once. The countdown milestones kept our DJ, mixologist, and bakery on schedule with zero late surprises.',
    author: 'Julian R.',
    event: 'Skyline Rooftop 30th',
    scale: '65 Guests',
  },
  {
    quote:
      'Our foundation gala hit our highest fundraising goal ever while staying 15% under venue and catering envelopes. CelebratePro is simply indispensable for modern hosts.',
    author: 'Dr. Sarah Jenkins',
    event: 'Annual Charity Gala Chair',
    scale: '200 Guests',
  },
];

export function LovedByHosts() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-[#073330] via-[#09423e] to-[#073330] text-white overflow-hidden">
      {/* Decorative Whimsical Wave Background Texture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves" width="100" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q 25 5, 50 20 T 100 20" fill="none" stroke="#00e599" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading (Matching Inspo) */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Loved by over{' '}
            <span className="bg-[#dcfce7] text-[#073330] px-4 py-1.5 rounded-2xl inline-block shadow-sm">
              5,000+
            </span>{' '}
            event hosts
          </h2>
          <p className="text-sm sm:text-base text-slate-200 font-normal">
            Read what host couples, birthday honorees, and gala coordinators say about planning with CelebratePro.
          </p>
        </div>

        {/* 3 Testimonial Cards (Warm Cream / Alabaster matching Inspo Screenshot 5) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Whimsical Floating Swimmer Doodles (Echoing Going Screenshot 5) */}
          <div className="hidden lg:block absolute -top-10 left-1/3 -translate-x-1/2 z-20 pointer-events-none">
            <svg width="90" height="50" viewBox="0 0 90 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 25 C25 15 45 35 60 25 C75 15 85 20 85 20" stroke="#00e599" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="65" cy="15" r="7" fill="#ff9e7d" stroke="#073330" strokeWidth="2" />
              <path d="M60 18 Q 70 12 75 22" fill="#00e599" />
            </svg>
          </div>

          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#fffdfa] rounded-3xl p-8 text-[#073330] shadow-xl flex flex-col justify-between border border-slate-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#073330]">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.event}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#073330] bg-[#dcfce7] px-2.5 py-1 rounded-full">
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
