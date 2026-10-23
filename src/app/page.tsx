'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { EventType } from '@/types';
import type { EventWithStats } from '@/lib/events';
import { EventCard } from '@/components/events/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/events/DeleteConfirmModal';
import { formatCurrency } from '@/lib/formatters';

export default function HomePage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load celebrations.');
      }
      setEvents(json.data);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not connect to the database. Please refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.event_type === activeFilter);
  }, [events, activeFilter]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const totalBudget = events.reduce((acc, e) => acc + (e.total_budget || 0), 0);
    const totalGuests = events.reduce((acc, e) => acc + (e.guest_count || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingCount = events.filter((e) => e.event_date >= todayStr).length;

    return {
      totalEvents: events.length,
      totalBudget,
      totalGuests,
      upcomingCount,
    };
  }, [events]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleEventCreated = () => {
    showNotification('Celebration created successfully! Get started with your budget and AI planning.');
    fetchEvents();
  };

  const handleDeleteConfirm = async (event: { id: number; name: string }) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete celebration.');
      }
      setEventToDelete(null);
      showNotification(`"${event.name}" was successfully removed.`);
      fetchEvents();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600 focus:shadow-lg dark:focus:bg-zinc-900"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
              ✨
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl text-zinc-900 dark:text-zinc-50">
                Celebration & Event Planner
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                GenAI-Powered Planning for Weddings, Birthdays & Community Events
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Plan Celebration</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        {notification && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 shadow-xs animate-in slide-in-from-top-2"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="Dismiss message"
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Overview Cards */}
        <section aria-labelledby="stats-heading" className="mb-8">
          <h2 id="stats-heading" className="sr-only">
            Event Planning Statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Celebrations</span>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {stats.totalEvents}
              </p>
              <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {stats.upcomingCount} upcoming
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Budget Managed</span>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(stats.totalBudget)}
              </p>
              <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Tracked in real-time</span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Expected Guests</span>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {stats.totalGuests.toLocaleString()}
              </p>
              <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Across all events</span>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-xs dark:border-blue-900/50 dark:bg-blue-950/30">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">GenAI Assistant</span>
              <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Ready to generate custom vendor checklists, timelines, and ideas.
              </p>
              <span className="mt-1 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
                Select an event below
              </span>
            </div>
          </div>
        </section>

        {/* Filter Pills */}
        <section aria-labelledby="filter-heading" className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="filter-heading" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Your Celebrations
          </h2>

          <div
            role="toolbar"
            aria-label="Filter events by category"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {[
              { id: 'all', label: 'All Celebrations' },
              { id: 'wedding', label: '💍 Weddings' },
              { id: 'birthday', label: '🎂 Birthdays' },
              { id: 'community', label: '🏘️ Community' },
              { id: 'other', label: '🎉 Other' },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as EventType | 'all')}
                  aria-pressed={active}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Events Grid / Empty States */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl dark:bg-blue-950/60 text-blue-600">
              🎉
            </div>
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {activeFilter === 'all'
                ? 'No celebrations planned yet'
                : `No ${activeFilter} celebrations found`}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Create your first event to get personalized AI checklists, timeline milestones, and budget trackers.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Plan Your First Celebration</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDeleteRequest={(evt) => setEventToDelete(evt)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <p>PromptWar Challenge 5: Celebration & Event Planner • GenAI-Powered Assistant</p>
      </footer>

      {/* Modals */}
      <EventFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleEventCreated}
      />

      <DeleteConfirmModal
        isOpen={!!eventToDelete}
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
