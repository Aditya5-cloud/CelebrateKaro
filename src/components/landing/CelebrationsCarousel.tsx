'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface CelebrationCard {
  id: string;
  title: string;
  location: string;
  image: string;
  badge: string;
  scale: string;
  guests: number;
  category: string;
}

const CELEBRATIONS: CelebrationCard[] = [
  {
    id: '1',
    title: 'Royal Vivah & Shaadi',
    location: 'Palace Courtyard, Jaipur • Sunset Pheras & Sangeet',
    image: '/images/wedding.jpg',
    badge: '₹35,00,000 Budget',
    scale: '350 Guests • Mandap & Halwai Sorted',
    guests: 350,
    category: '💍 Shaadi & Vivah',
  },
  {
    id: '2',
    title: 'Family Janamdin Milestone',
    location: 'Family Courtyard, South Mumbai • 80th Milestone',
    image: '/images/BIrthday.jpg',
    badge: '₹6,50,000 Budget',
    scale: '85 Guests • Multi-Generation Feast & Mithai',
    guests: 85,
    category: '🎂 Janamdin',
  },
  {
    id: '3',
    title: 'Mahaprasad Sewa Bhandara',
    location: 'Community Ghats, Varanasi • Annual Parv & Mela',
    image: '/images/Bhandara.jpg',
    badge: '₹12,00,000 Budget',
    scale: '1,200 Guests • Traditional Pangat Service',
    guests: 1200,
    category: '🍲 Bhandara & Mela',
  },
  {
    id: '4',
    title: 'Sangeet & Tayaari Studio',
    location: 'Heritage Resort, Delhi NCR • Choreography & Live Band',
    image: '/images/image (1).jpg',
    badge: '₹22,00,000 Budget',
    scale: '220 Guests • Stage, Audio & Decor Envelopes',
    guests: 220,
    category: '🎉 Festive Social',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CelebrationsCarousel({ onSelectEvent }: { onSelectEvent?: (title: string) => void } = {}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((curr) => (curr > 0 ? curr - 1 : CELEBRATIONS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((curr) => (curr < CELEBRATIONS.length - 1 ? curr + 1 : 0));
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF6EF] text-[#1E1B4B] overflow-hidden border-b border-amber-900/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading with clean, non-overlapping spacing */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-300/70 font-body">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Real Celebrations Planned with CelebrateKaro</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1E1B4B] leading-tight">
            Palace Shaadis se Lekar Sacred Bhandaras Tak
          </h2>
          <p className="text-base sm:text-lg text-stone-600 font-body max-w-2xl mx-auto">
            Har ceremony, auspicious muhurat, aur Halwai budget — bina kisi spreadsheet chaos ke serene tareeqe se manage karo.
          </p>
        </div>

        {/* Showcase Grid with clean image on top, structured content below — 0 text overlap */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {CELEBRATIONS.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  className={`group flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-300 select-none ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl -translate-y-1'
                      : 'border-amber-900/10 shadow-sm hover:shadow-md hover:border-amber-300'
                  }`}
                >
                  {/* Photo Frame with Category & Target Budget Badges */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Chip */}
                    <div className="absolute top-3 left-3 bg-[#1E1B4B]/85 backdrop-blur-md text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-400/30 font-body shadow-xs">
                      {item.category}
                    </div>
                    {/* Budget Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs font-body">
                      {item.badge}
                    </div>
                  </div>

                  {/* Clean Content Area (Completely below image, no overlapping text) */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-xs font-bold text-amber-700 font-body block uppercase tracking-wider">
                        {item.scale}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#1E1B4B] mt-1 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 font-body mt-1.5 leading-relaxed">
                        {item.location}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between text-xs font-body">
                      <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Milestones Sorted</span>
                      </span>
                      <span className="font-bold text-[#1E1B4B] bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        {item.guests} Attending
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous celebration"
              className="w-11 h-11 rounded-full bg-[#1E1B4B] text-amber-300 flex items-center justify-center hover:bg-[#2e2968] hover:scale-105 transition-all shadow-md cursor-pointer border border-amber-400/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {CELEBRATIONS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    i === activeIndex ? 'w-8 bg-[#D97706]' : 'w-2.5 bg-stone-300'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next celebration"
              className="w-11 h-11 rounded-full bg-[#1E1B4B] text-amber-300 flex items-center justify-center hover:bg-[#2e2968] hover:scale-105 transition-all shadow-md cursor-pointer border border-amber-400/20"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
