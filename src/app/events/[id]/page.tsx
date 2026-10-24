'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  LayoutDashboard,
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  Bot,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { EventWithStats } from '@/lib/events';
import { EventTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, getRelativeDays } from '@/lib/formatters';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/events/DeleteConfirmModal';
import { BudgetTracker } from '@/components/budget/BudgetTracker';
import { TimelineTracker } from '@/components/timeline/TimelineTracker';
import { VendorTracker } from '@/components/vendors/VendorTracker';
import { ChecklistTracker } from '@/components/checklist/ChecklistTracker';
import { ChatAssistant } from '@/components/chat/ChatAssistant';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'budget' | 'timeline' | 'vendors' | 'assistant'>('overview');

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
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-zinc-500">Loading celebration details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="max-w-md text-center rounded-2xl bg-white p-8 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <p className="text-red-600 font-semibold">{error || 'Event not found.'}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const relativeDate = getRelativeDays(event.event_date);

  const tabs = [
    { id: 'overview', label: 'Overview & Summary', icon: LayoutDashboard },
    { id: 'checklist', label: '✨ AI Checklist', icon: Sparkles },
    { id: 'budget', label: 'Budget Tracker', icon: DollarSign },
    { id: 'timeline', label: 'Timeline & Milestones', icon: Calendar },
    { id: 'vendors', label: 'Vendor Directory', icon: Users },
    { id: 'assistant', label: 'AI Chat Assistant', icon: Bot },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      {/* Top Header bar */}
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Edit3 className="h-3.5 w-3.5 text-zinc-500" />
              <span>Edit Details</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-1.5 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/70 shadow-none"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main hero & tabs */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Title Banner */}
        <section
          aria-labelledby="event-hero-title"
          className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-indigo-50/50 to-blue-50/20 rounded-full blur-3xl pointer-events-none dark:from-indigo-950/20 dark:to-transparent" />

          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.event_type} />
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                relativeDate.isPast
                  ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              }`}
            >
              <Clock className="w-3 h-3" />
              {relativeDate.label}
            </span>
          </div>

          <h1 id="event-hero-title" className="mt-3.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {event.name}
          </h1>

          {event.description && (
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
            <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Date of Celebration
              </span>
              <p className="mt-1 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formatDate(event.event_date)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Target Budget
              </span>
              <p className="mt-1 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(event.total_budget)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Expected Guests
              </span>
              <p className="mt-1 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {event.guest_count.toLocaleString()} attendees
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />
                Planning Status
              </span>
              <p className="mt-1 text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                {relativeDate.isPast ? 'Completed' : 'Active Planning'}
              </p>
            </div>
          </div>
        </section>

        {/* Feature Navigation Tabs */}
        <div className="mt-8 border-b border-zinc-200 dark:border-zinc-800">
          <nav aria-label="Event sections" className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-3 text-sm font-semibold transition-all ${
                    active
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
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
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      Budget Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
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
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <span>Manage Budget Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      Timeline & Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                      {event.milestones_count} Milestones
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {event.milestones_completed} completed so far
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('timeline')}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <span>View Timeline Milestones</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Users className="w-4 h-4" />
                      </div>
                      Vendor Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                      {event.vendors_count} Vendors
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Track inquiries, quotes, and booked contracts
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vendors')}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <span>Open Vendor Checklist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant teaser / callout */}
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-violet-50/50 p-6 sm:p-8 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-violet-950/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      AI Planning Concierge
                    </span>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      Generate personalized recommendations for {event.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      The AI Assistant will tailor recommendations to your {event.event_type} celebration with {event.guest_count} guests and a {formatCurrency(event.total_budget)} budget.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('assistant')}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Open AI Chat Assistant</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <ChecklistTracker event={event} onChecklistUpdated={fetchEvent} />
          )}

          {activeTab === 'budget' && (
            <BudgetTracker event={event} onBudgetUpdated={fetchEvent} />
          )}

          {activeTab === 'timeline' && (
            <TimelineTracker event={event} onTimelineUpdated={fetchEvent} />
          )}

          {activeTab === 'vendors' && (
            <VendorTracker event={event} onVendorUpdated={fetchEvent} />
          )}

          {activeTab === 'assistant' && (
            <ChatAssistant event={event} />
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
