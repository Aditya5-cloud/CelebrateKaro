'use client';

import React from 'react';
import { Heart, PartyPopper, Wine, Sparkles, ArrowRight } from 'lucide-react';

interface EventCategoriesGridProps {
  onSelectCategory?: (type: string) => void;
}

const CATEGORIES = [
  {
    type: 'wedding',
    title: 'Weddings & Receptions',
    description: 'Intimate terrace vows, floral pergolas, catering tastings, and serene guest seating charts.',
    icon: <Heart className="w-5 h-5" />,
    gradient: 'from-rose-500 to-pink-600',
    hoverBorder: 'hover:border-rose-400',
    lightBg: 'bg-rose-50/80 dark:bg-rose-950/20',
    accentText: 'text-rose-600 dark:text-rose-400',
    sampleMetric: 'Avg. 120 Guests • $28k Budget',
  },
  {
    type: 'birthday',
    title: 'Milestone Birthdays',
    description: 'City skyline rooftops, bespoke mixology, resident vinyl DJs, and custom celebration cakes.',
    icon: <PartyPopper className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-600',
    hoverBorder: 'hover:border-amber-400',
    lightBg: 'bg-amber-50/80 dark:bg-amber-950/20',
    accentText: 'text-amber-600 dark:text-amber-400',
    sampleMetric: 'Avg. 65 Guests • $8.5k Budget',
  },
  {
    type: 'community',
    title: 'Galas & Banquets',
    description: 'Black-tie fundraisers, botanical conservatory dinners, silent auctions, and live entertainment.',
    icon: <Wine className="w-5 h-5" />,
    gradient: 'from-violet-500 to-purple-600',
    hoverBorder: 'hover:border-violet-400',
    lightBg: 'bg-violet-50/80 dark:bg-violet-950/20',
    accentText: 'text-violet-600 dark:text-violet-400',
    sampleMetric: 'Avg. 200 Guests • $45k Budget',
  },
  {
    type: 'other',
    title: 'Festivals & Socials',
    description: 'Sunset beach gatherings, acoustic bonfire nights, family reunions, and seasonal celebrations.',
    icon: <Sparkles className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-teal-600',
    hoverBorder: 'hover:border-emerald-400',
    lightBg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    sampleMetric: 'Avg. 85 Guests • $12k Budget',
  },
];

export function EventCategoriesGrid({ onSelectCategory }: EventCategoriesGridProps) {
  return (
    <section className="py-12 border-y border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built for every kind of memorable celebration
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Whether an intimate dinner of 20 or a grand gala of 300, CelebrateKaro adapts to your scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.type}
              onClick={() => onSelectCategory?.(cat.type)}
              className={`p-6 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 ${cat.hoverBorder} transition-all duration-200 hover:shadow-lg cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${cat.gradient} shadow-sm group-hover:scale-108 transition-transform`}>
                  {cat.icon}
                </div>

                <h3 className="mt-4 font-extrabold text-base text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {cat.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {cat.sampleMetric}
                </span>
                <span className={`text-xs font-bold ${cat.accentText} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                  Plan <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
