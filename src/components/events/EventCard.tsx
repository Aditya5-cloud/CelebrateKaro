'use client';

import React from 'react';
import Link from 'next/link';
import type { EventWithStats } from '@/lib/events';
import { EventTypeBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getRelativeDays } from '@/lib/formatters';

interface EventCardProps {
  event: EventWithStats;
  onDeleteRequest: (event: EventWithStats) => void;
}

export function EventCard({ event, onDeleteRequest }: EventCardProps) {
  const relativeDate = getRelativeDays(event.event_date);

  return (
    <article
      aria-labelledby={`event-title-${event.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                relativeDate.isPast
                  ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  : relativeDate.days <= 14
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
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
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>

        <h3
          id={`event-title-${event.id}`}
          className="mt-3 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          <Link href={`/events/${event.id}`} prefetch={false} className="focus:outline-hidden focus:underline">
            {event.name}
          </Link>
        </h3>

        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {event.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/50">
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400">Date</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {formatDate(event.event_date)}
            </span>
          </div>
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400">Budget</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {formatCurrency(event.total_budget)}
            </span>
          </div>
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400">Guests</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {event.guest_count.toLocaleString()} expected
            </span>
          </div>
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400">Planning Items</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {event.checklist_count > 0
                ? `${event.checklist_completed}/${event.checklist_count} tasks`
                : `${event.vendors_count} vendors`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Link
          href={`/events/${event.id}`}
          prefetch={false}
          className="inline-flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <span>Open Planner Assistant</span>
          <svg
            className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
