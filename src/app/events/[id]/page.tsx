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
import { InspoFooter } from '@/components/landing/InspoFooter';

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
      <div className="min-h-screen bg-[#f2f5f3] p-8 flex flex-col items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#073330] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-[#073330]">Loading celebration details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#f2f5f3] p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center rounded-3xl bg-white p-8 shadow-sm border border-[#073330]/10">
          <p className="text-rose-600 font-bold">{error || 'Event not found.'}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#073330] px-4 py-2 text-sm font-bold text-white hover:bg-[#09423e] transition-colors"
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
    { id: 'overview', label: 'Overview & Summary', icon: LayoutDashboard, color: 'text-amber-500', badge: undefined },
    { id: 'checklist', label: '✨ AI Checklist', icon: Sparkles, color: 'text-emerald-500', badge: undefined },
    { id: 'budget', label: 'Budget Tracker', icon: DollarSign, color: 'text-emerald-600', badge: formatCurrency(event.total_budget) },
    { id: 'timeline', label: 'Timeline & Milestones', icon: Calendar, color: 'text-blue-500', badge: `${event.milestones_count}` },
    { id: 'vendors', label: 'Vendor Directory', icon: Users, color: 'text-purple-500', badge: `${event.vendors_count}` },
    { id: 'assistant', label: 'AI Chat Assistant', icon: Bot, color: 'text-teal-500', badge: undefined },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f2f5f3] text-[#073330] flex flex-col justify-between">
      {/* Top Header bar */}
      <header className="border-b border-white/10 bg-[#073330] text-white sticky top-0 z-20 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#00e599]" />
              {event.name}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5 text-xs font-bold border-white/20 text-white bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-1.5 text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-400/30 rounded-xl shadow-none cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── SIDEBAR + MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* ─── LEFT SIDEBAR ─── */}
        <aside
          aria-label="Event Sidebar"
          className="w-full md:w-64 lg:w-72 bg-white border-r border-[#073330]/10 p-5 sm:p-6 flex flex-col justify-between shrink-0 shadow-xs"
        >
          <div className="space-y-6">
            {/* Event Profile Card */}
            <div className="p-4 rounded-2xl bg-[#0a3d39] text-white shadow-sm space-y-3 border border-[#00e599]/30">
              <div className="flex items-center justify-between gap-2">
                <EventTypeBadge type={event.event_type} />
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                    relativeDate.isPast
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-[#00e599]/20 text-[#00e599] border-[#00e599]/40'
                  }`}
                >
                  <Clock className="w-3 h-3 text-[#00e599]" />
                  {relativeDate.label}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black truncate leading-tight text-white" title={event.name}>
                  {event.name}
                </h2>
                <p className="text-xs text-slate-300 font-medium leading-tight mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#00e599]" />
                  {formatDate(event.event_date)}
                </p>
              </div>
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span>Target Budget</span>
                <span className="text-[#00e599] font-bold">
                  {formatCurrency(event.total_budget)}
                </span>
              </div>
            </div>

            {/* Vertical Navigation Tabs */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
                Event Sections
              </span>
              <nav aria-label="Event sections" className="space-y-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      aria-pressed={active}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#073330] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-[#f2f5f3] hover:text-[#073330]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00e599]' : tab.color}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            active ? 'bg-[#00e599] text-[#073330]' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Event Snapshot in Sidebar */}
            <div className="p-4 rounded-2xl bg-[#f2f5f3] border border-[#073330]/10 space-y-2.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Event Snapshot
              </span>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium">Total Budget:</span>
                <span className="font-extrabold text-[#073330]">{formatCurrency(event.total_budget)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium">Expected Guests:</span>
                <span className="font-extrabold text-[#073330]">{event.guest_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium">Milestones:</span>
                <span className="font-extrabold text-[#073330]">{event.milestones_completed}/{event.milestones_count}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium">Vendors:</span>
                <span className="font-extrabold text-[#073330]">{event.vendors_count} booked</span>
              </div>
            </div>
          </div>

          {/* Sidebar Bottom Back Link */}
          <div className="pt-6 mt-6 border-t border-slate-200/80">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-[#073330] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#073330]" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </aside>

        {/* ─── MAIN CONTENT PANE ─── */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-6 overflow-y-auto max-w-7xl">
          {/* Event Title Banner */}
          <section
            aria-labelledby="event-hero-title"
            className="rounded-3xl border border-[#073330]/10 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <EventTypeBadge type={event.event_type} />
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                      relativeDate.isPast
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-[#dcfce7] text-[#073330] border-[#bbf7d0]'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-[#073330]" />
                    {relativeDate.label}
                  </span>
                </div>

                <h1 id="event-hero-title" className="mt-3.5 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#073330]">
                  {event.name}
                </h1>

                {event.description && (
                  <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed font-medium">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1.5 text-xs font-bold border-[#073330]/20 text-[#073330] hover:bg-[#f2f5f3] rounded-xl cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-1.5 text-xs font-bold bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border border-rose-300 rounded-xl shadow-none cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 border-t border-slate-100 pt-6">
              <div className="p-3.5 rounded-2xl bg-[#f2f5f3] border border-[#073330]/10">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#073330]" />
                  Celebration Date
                </span>
                <p className="mt-1 text-sm sm:text-base font-bold text-[#073330]">
                  {formatDate(event.event_date)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f2f5f3] border border-[#073330]/10">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  Target Budget
                </span>
                <p className="mt-1 text-sm sm:text-base font-bold text-[#073330]">
                  {formatCurrency(event.total_budget)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f2f5f3] border border-[#073330]/10">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  Expected Guests
                </span>
                <p className="mt-1 text-sm sm:text-base font-bold text-[#073330]">
                  {event.guest_count.toLocaleString()} attendees
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f2f5f3] border border-[#073330]/10">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Planning Status
                </span>
                <p className="mt-1 text-sm sm:text-base font-bold text-[#073330]">
                  {relativeDate.isPast ? 'Completed' : 'Active Planning'}
                </p>
              </div>
            </div>
          </section>

          {/* Tab Content Panes */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Budget Status Card */}
                  <Card className="rounded-3xl border border-[#073330]/10 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-black flex items-center gap-2.5 text-[#073330]">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                          <DollarSign className="w-4 h-4 text-emerald-700" />
                        </div>
                        <span>Budget Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black tracking-tight text-[#073330]">
                        {formatCurrency(event.total_budget)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 font-medium">
                        {event.total_planned_budget > 0
                          ? `${formatCurrency(event.total_planned_budget)} planned across categories`
                          : 'No category breakdown configured yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('budget')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                      >
                        <span>Manage Budget Categories</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                      </button>
                    </CardContent>
                  </Card>

                  {/* Timeline & Deadlines Card */}
                  <Card className="rounded-3xl border border-[#073330]/10 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-black flex items-center gap-2.5 text-[#073330]">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                          <Calendar className="w-4 h-4 text-amber-700" />
                        </div>
                        <span>Timeline & Deadlines</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black tracking-tight text-[#073330]">
                        {event.milestones_count} Milestones
                      </p>
                      <p className="mt-1 text-xs text-slate-600 font-medium">
                        {event.milestones_completed} completed so far
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('timeline')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                      >
                        <span>View Timeline Milestones</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    </CardContent>
                  </Card>

                  {/* Vendor Checklist Card */}
                  <Card className="rounded-3xl border border-[#073330]/10 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-black flex items-center gap-2.5 text-[#073330]">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                          <Users className="w-4 h-4 text-blue-700" />
                        </div>
                        <span>Vendor Checklist</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black tracking-tight text-[#073330]">
                        {event.vendors_count} Vendors
                      </p>
                      <p className="mt-1 text-xs text-slate-600 font-medium">
                        Track inquiries, quotes, and booked contracts
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('vendors')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                      >
                        <span>Open Vendor Checklist</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                      </button>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Assistant teaser / callout */}
                <div className="rounded-3xl border border-[#073330]/20 bg-[#073330] p-6 sm:p-8 text-white shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="max-w-2xl">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#00e599]">
                        <Sparkles className="w-3.5 h-3.5 text-[#00e599]" />
                        AI Planning Concierge
                      </span>
                      <h3 className="mt-3 text-xl font-bold tracking-tight text-white">
                        Generate personalized recommendations for {event.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                        The AI Assistant will tailor recommendations to your {event.event_type} celebration with {event.guest_count} guests and a {formatCurrency(event.total_budget)} budget.
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('assistant')}
                      variant="mint"
                      className="gap-2 text-[#073330] font-bold shadow-sm shrink-0 cursor-pointer"
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
      </div>

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

      <InspoFooter />
    </div>
  );
}
