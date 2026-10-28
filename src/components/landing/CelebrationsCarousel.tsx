'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

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

export function CelebrationsCarousel() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FFF3C7] text-[#2A0E1C] overflow-hidden border-b-2 border-[#FEC7B4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading with clean, generous spacing */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#FEC7B4] text-[#F7418F] text-xs sm:text-sm font-bold border border-[#FC819E]">
            <Sparkles className="w-4 h-4 text-[#F7418F]" />
            <span>Popular Celebrations Planned with CelebrateKaro</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-[#2A0E1C] leading-tight">
            From Palace Vivahs to Sacred Community Melas
          </h2>
          <p className="text-base sm:text-xl text-[#2A0E1C]/80 max-w-2xl mx-auto leading-relaxed">
            Every ceremony, auspicious muhurat, and Halwai budget — coordinated effortlessly without spreadsheet chaos.
          </p>
        </div>

        {/* Showcase Grid with clean image on top, structured content below — non-clickable showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {CELEBRATIONS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white rounded-none overflow-hidden border-2 border-[#FEC7B4] shadow-xs select-none"
            >
              {/* Photo Frame with Category & Target Budget Badges */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-[#2A0E1C]/5 shrink-0 border-b-2 border-[#FEC7B4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {/* Category Chip */}
                <div className="absolute top-3 left-3 bg-[#2A0E1C]/90 text-[#FFF3C7] text-[11px] font-bold px-2.5 py-1 rounded-none border border-[#F7418F]/40 shadow-xs">
                  {item.category}
                </div>
                {/* Budget Badge */}
                <div className="absolute top-3 right-3 bg-[#F7418F] text-white text-[11px] font-bold px-2.5 py-1 rounded-none shadow-xs">
                  {item.badge}
                </div>
              </div>

              {/* Clean Content Area (Completely below image, no overlapping text) */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
                <div>
                  <span className="text-xs font-bold text-[#F7418F] block uppercase tracking-wider">
                    {item.scale}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A0E1C] mt-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2A0E1C]/75 mt-1.5 leading-relaxed">
                    {item.location}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FEC7B4] flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#2A0E1C] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#F7418F] shrink-0" />
                    <span>Milestones Sorted</span>
                  </span>
                  <span className="font-bold text-[#2A0E1C] bg-[#FFF3C7] border border-[#FEC7B4] px-2.5 py-0.5 rounded-none">
                    {item.guests} Attending
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
