'use client';

import React from 'react';
import Link from 'next/link';
import type { EventWithStats } from '@/lib/events';
import { EventTypeBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getRelativeDays } from '@/lib/formatters';
import { Calendar, IndianRupee, Users, CheckSquare, Trash2, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventWithStats;
  onDeleteRequest: (event: EventWithStats) => void;
}

export function EventCard({ event, onDeleteRequest }: EventCardProps) {
  const relativeDate = getRelativeDays(event.event_date);

  return (
    <article
      aria-labelledby={`event-title-${event.id}`}
      className="group relative flex flex-col justify-between rounded-none border border-[#FEC7B4] bg-white p-6 shadow-xs transition-all duration-200 hover:border-[#F7418F] hover:shadow-md"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-none border ${
                relativeDate.isPast
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : relativeDate.days <= 14
                  ? 'bg-[#FC819E]/20 text-[#F7418F] border-[#FC819E]'
                  : 'bg-[#FEC7B4]/40 text-[#2A0E1C] border-[#FEC7B4]'
              }`}
            >
              {relativeDate.isPast ? `🎉 ${relativeDate.label}` : relativeDate.label}
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
            className="rounded-none p-2 text-[#2A0E1C]/50 hover:bg-[#FEC7B4]/40 hover:text-[#F7418F] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Title */}
        <h3
          id={`event-title-${event.id}`}
          className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-[#2A0E1C] group-hover:text-[#F7418F] transition-colors font-headline"
        >
          <Link href={`/events/${event.id}`} prefetch={false} className="focus:outline-hidden focus:underline">
            {event.name}
          </Link>
        </h3>

        {/* Description */}
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-[#2A0E1C]/75 leading-relaxed font-normal">
            {event.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-none border border-[#FEC7B4] bg-[#FFF3C7]/40 p-3.5 text-xs">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2A0E1C]/70">
              <Calendar className="h-3.5 w-3.5 text-[#F7418F] shrink-0" aria-hidden="true" /> Date
            </span>
            <span className="block font-bold text-[#2A0E1C] truncate">
              {formatDate(event.event_date)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2A0E1C]/70">
              <IndianRupee className="h-3.5 w-3.5 text-[#F7418F] shrink-0" aria-hidden="true" /> Budget
            </span>
            <span className="block font-bold text-[#2A0E1C] truncate">
              {formatCurrency(event.total_budget)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2A0E1C]/70">
              <Users className="h-3.5 w-3.5 text-[#FC819E] shrink-0" aria-hidden="true" /> Guests
            </span>
            <span className="block font-bold text-[#2A0E1C] truncate">
              {event.guest_count.toLocaleString()} expected
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2A0E1C]/70">
              <CheckSquare className="h-3.5 w-3.5 text-[#F7418F] shrink-0" aria-hidden="true" /> Planning Items
            </span>
            <span className="block font-bold text-[#2A0E1C] truncate">
              {event.checklist_count > 0
                ? `${event.checklist_completed}/${event.checklist_count} tasks`
                : `${event.vendors_count} vendors`}
            </span>
          </div>
        </div>

        {/* Concluded Celebration Wrap-Up Pill */}
        {relativeDate.isPast && (
          <div className="mt-3 px-3 py-1.5 rounded-none bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🎉</span>
              <span>Celebration Concluded</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Archived</span>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-5 border-t border-[#FEC7B4] pt-3">
        <Link
          href={`/events/${event.id}`}
          prefetch={false}
          className="inline-flex w-full items-center justify-between rounded-none px-3 py-2 text-xs sm:text-sm font-bold text-[#2A0E1C] hover:bg-[#FEC7B4]/50 hover:text-[#F7418F] transition-colors group/link cursor-pointer"
        >
          <span>{relativeDate.isPast ? 'View Celebration Wrap-Up' : 'Open Planner Assistant'}</span>
          <ArrowRight className="h-4 w-4 text-[#F7418F] group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
