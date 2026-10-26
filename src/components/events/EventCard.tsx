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
      className="group relative flex flex-col justify-between rounded-3xl border border-[#073330]/15 bg-[#fffdfa] p-6 shadow-sm transition-all duration-300 hover:border-[#00e599] hover:shadow-xl"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                relativeDate.isPast
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : relativeDate.days <= 14
                  ? 'bg-[#ff9e7d]/20 text-[#073330] border-[#ff9e7d]/40 font-bold'
                  : 'bg-[#dcfce7] text-[#073330] border-[#bbf7d0] font-bold'
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
            className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Title */}
        <h3
          id={`event-title-${event.id}`}
          className="mt-4 text-base sm:text-lg font-black tracking-tight text-[#073330] group-hover:text-[#09423e] transition-colors"
        >
          <Link href={`/events/${event.id}`} prefetch={false} className="focus:outline-hidden focus:underline">
            {event.name}
          </Link>
        </h3>

        {/* Description */}
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {event.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl border border-[#073330]/10 bg-[#faf8f4] p-3.5 text-xs">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Calendar className="h-3 w-3 text-[#073330]" /> Date
            </span>
            <span className="block font-bold text-[#073330] truncate">
              {formatDate(event.event_date)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <DollarSign className="h-3 w-3 text-emerald-600" /> Budget
            </span>
            <span className="block font-bold text-[#073330] truncate">
              {formatCurrency(event.total_budget)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Users className="h-3 w-3 text-blue-600" /> Guests
            </span>
            <span className="block font-bold text-[#073330] truncate">
              {event.guest_count.toLocaleString()} expected
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <CheckSquare className="h-3 w-3 text-[#00e599]" /> Planning Items
            </span>
            <span className="block font-bold text-[#073330] truncate">
              {event.checklist_count > 0
                ? `${event.checklist_completed}/${event.checklist_count} tasks`
                : `${event.vendors_count} vendors`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 border-t border-slate-100 pt-3">
        <Link
          href={`/events/${event.id}`}
          prefetch={false}
          className="inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#073330] hover:bg-[#dcfce7]/50 transition-colors group/link cursor-pointer"
        >
          <span>Open Planner Assistant</span>
          <ArrowRight className="h-4 w-4 text-[#073330] group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
