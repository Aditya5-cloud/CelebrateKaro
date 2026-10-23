'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { EventWithStats } from '@/lib/events';
import { EventTypeBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getRelativeDays } from '@/lib/formatters';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/events/DeleteConfirmModal';
import { BudgetTracker } from '@/components/budget/BudgetTracker';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline' | 'vendors' | 'assistant'>('overview');

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${rawId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Event could not be found.');
      }
      setEvent(json.data);
    } catch (err: unknown) {
      console.error(err);
      setError('Event not found or failed to load. Please return to the dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [rawId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleDeleteConfirm = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete event.');
      }
      router.push('/');
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-500">Loading celebration details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="max-w-md text-center rounded-2xl bg-white p-8 shadow-xs border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <p className="text-red-600 font-semibold">{error || 'Event not found.'}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ← Back to All Celebrations
          </Link>
        </div>
      </div>
    );
  }

  const relativeDate = getRelativeDays(event.event_date);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      {/* Header bar */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main hero & tabs */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Title Banner */}
        <section aria-labelledby="event-hero-title" className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                relativeDate.isPast
                  ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
              }`}
            >
              {relativeDate.label}
            </span>
          </div>

          <h1 id="event-hero-title" className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {event.name}
          </h1>

          {event.description && (
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 max-w-3xl">
              {event.description}
            </p>
          )}

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Date of Celebration</span>
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formatDate(event.event_date)}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Target Budget</span>
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(event.total_budget)}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Expected Guests</span>
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {event.guest_count.toLocaleString()} attendees
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Planning Status</span>
              <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                {relativeDate.isPast ? 'Completed' : 'Active Planning'}
              </p>
            </div>
          </div>
        </section>

        {/* Feature Navigation Tabs */}
        <div className="mt-8 border-b border-zinc-200 dark:border-zinc-800">
          <nav aria-label="Event sections" className="-mb-px flex space-x-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Ideas' },
              { id: 'budget', label: 'Budget Tracker' },
              { id: 'timeline', label: 'Timeline & Milestones' },
              { id: 'vendors', label: 'Vendor Checklist' },
              { id: 'assistant', label: '✨ AI Assistant' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Panes */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">💰 Budget Status</h3>
                  <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(event.total_budget)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {event.total_planned_budget > 0
                      ? `${formatCurrency(event.total_planned_budget)} planned across categories`
                      : 'No category breakdown configured yet.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('budget')}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Manage Budget Categories →
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">📅 Timeline & Deadlines</h3>
                  <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {event.milestones_count} Milestones
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {event.milestones_completed} completed so far
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('timeline')}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View Timeline Milestones →
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">🤝 Vendor Checklist</h3>
                  <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {event.vendors_count} Vendors
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Track inquiries, quotes, and booked contracts
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vendors')}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open Vendor Checklist →
                  </button>
                </div>
              </div>

              {/* AI Assistant teaser / callout */}
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      ✨ GenAI Planning Assistant
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Generate personalized recommendations for {event.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                      The AI Assistant will tailor recommendations to your {event.event_type} celebration with {event.guest_count} guests and a {formatCurrency(event.total_budget)} budget.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assistant')}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
                  >
                    Open AI Chat Assistant
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <BudgetTracker event={event} onBudgetUpdated={fetchEvent} />
          )}

          {activeTab === 'timeline' && (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600 dark:bg-amber-950/60">
                📅
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Timeline & Milestones (Chunk 3)
              </h3>
              <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                Target date: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formatDate(event.event_date)}</span> ({relativeDate.label}).
                Date-ordered milestones, due-date tracking, and progress visualization will activate in Chunk 3.
              </p>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-600 dark:bg-purple-950/60">
                🤝
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Vendor Checklist (Chunk 4)
              </h3>
              <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                Vendor directory, status stages (considering, contacted, booked, paid), and quotes tracking will activate in Chunk 4.
              </p>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 dark:bg-blue-950/60">
                ✨
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                GenAI Planning Assistant (Chunks 5, 6 & 7)
              </h3>
              <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                AI Checklist generation, conversational planning assistant, and vendor email generator will activate in Chunks 5 through 7.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Edit and Delete Modals */}
      <EventFormModal
        isOpen={isEditModalOpen}
        initialEvent={event}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => fetchEvent()}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        event={event}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
