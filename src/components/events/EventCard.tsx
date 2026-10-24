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
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-zinc-700"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                relativeDate.isPast
                  ? 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                  : relativeDate.days <= 14
                  ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
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
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Title */}
        <h3
          id={`event-title-${event.id}`}
          className="mt-3.5 text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
        >
          <Link href={`/events/${event.id}`} prefetch={false} className="focus:outline-hidden focus:underline">
            {event.name}
          </Link>
        </h3>

        {/* Description */}
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-xs dark:border-zinc-800/60 dark:bg-zinc-800/40">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <Calendar className="h-3 w-3" /> Date
            </span>
            <span className="block font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {formatDate(event.event_date)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <DollarSign className="h-3 w-3" /> Budget
            </span>
            <span className="block font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {formatCurrency(event.total_budget)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <Users className="h-3 w-3" /> Guests
            </span>
            <span className="block font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {event.guest_count.toLocaleString()} expected
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <CheckSquare className="h-3 w-3" /> Planning Items
            </span>
            <span className="block font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {event.checklist_count > 0
                ? `${event.checklist_completed}/${event.checklist_count} tasks`
                : `${event.vendors_count} vendors`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Link
          href={`/events/${event.id}`}
          prefetch={false}
          className="inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors group/link"
        >
          <span>Open Planner Assistant</span>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover/link:translate-x-1 group-hover/link:text-violet-600 transition-all" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
