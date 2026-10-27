'use client';

import React from 'react';
import Link from 'next/link';
import type { EventWithStats } from '@/lib/events';
import { EventTypeBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getRelativeDays } from '@/lib/formatters';
import { Calendar, DollarSign, Users, CheckSquare, Trash2, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventWithStats;
  onDeleteRequest: (event: EventWithStats) => void;
}

export function EventCard({ event, onDeleteRequest }: EventCardProps) {
  const relativeDate = getRelativeDays(event.event_date);

  return (
    <article
      aria-labelledby={`event-title-${event.id}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xs transition-all duration-300 hover:border-amber-500 hover:shadow-lg"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                relativeDate.isPast
                  ? 'bg-stone-100 text-stone-600 border-stone-200'
                  : relativeDate.days <= 14
                  ? 'bg-rose-100 text-rose-900 border-rose-200'
                  : 'bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              {relativeDate.label}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteRequest(event);
            }}
            aria-label={`Delete event ${event.name}`}
            className="rounded-xl p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Title */}
        <h3
          id={`event-title-${event.id}`}
          className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-[#1E1B4B] group-hover:text-amber-700 transition-colors font-headline"
        >
          <Link href={`/events/${event.id}`} prefetch={false} className="focus:outline-hidden focus:underline">
            {event.name}
          </Link>
        </h3>

        {/* Description */}
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {event.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl border border-amber-900/10 bg-[#FAF6EF] p-3.5 text-xs">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
              <Calendar className="h-3.5 w-3.5 text-[#1E1B4B] shrink-0" aria-hidden="true" /> Date
            </span>
            <span className="block font-bold text-[#1E1B4B] truncate">
              {formatDate(event.event_date)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
              <DollarSign className="h-3.5 w-3.5 text-emerald-700 shrink-0" aria-hidden="true" /> Budget
            </span>
            <span className="block font-bold text-[#1E1B4B] truncate">
              {formatCurrency(event.total_budget)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
              <Users className="h-3.5 w-3.5 text-blue-700 shrink-0" aria-hidden="true" /> Guests
            </span>
            <span className="block font-bold text-[#1E1B4B] truncate">
              {event.guest_count.toLocaleString()} expected
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
              <CheckSquare className="h-3.5 w-3.5 text-amber-700 shrink-0" aria-hidden="true" /> Planning Items
            </span>
            <span className="block font-bold text-[#1E1B4B] truncate">
              {event.checklist_count > 0
                ? `${event.checklist_completed}/${event.checklist_count} tasks`
                : `${event.vendors_count} vendors`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 border-t border-amber-900/10 pt-3">
        <Link
          href={`/events/${event.id}`}
          prefetch={false}
          className="inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#1E1B4B] hover:bg-amber-100 transition-colors group/link cursor-pointer"
        >
          <span>Open Planner Assistant</span>
          <ArrowRight className="h-4 w-4 text-[#1E1B4B] group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
