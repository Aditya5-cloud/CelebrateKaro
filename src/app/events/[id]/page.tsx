'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  LayoutDashboard,
  Sparkles,
  IndianRupee,
  Calendar,
  Users,
  Bot,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
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
import { getCurrentUser, subscribeToAuthChanges } from '@/lib/auth';
import type { User } from '@/types';

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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'budget' | 'timeline' | 'vendors' | 'assistant'>('overview');
  const [previousTab, setPreviousTab] = useState<'overview' | 'checklist' | 'budget' | 'timeline' | 'vendors'>('overview');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Sync logged-in user state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = getCurrentUser();
      setCurrentUser(u);
    }
    const unsubscribe = subscribeToAuthChanges((newUser) => {
      setCurrentUser(newUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Check URL query parameters for direct tab navigation (e.g. ?tab=assistant)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'assistant') {
        setActiveTab('assistant');
      }
    }
  }, []);

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = typeof window !== 'undefined' ? getCurrentUser() : null;
      const headers: Record<string, string> = {};
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }
      const res = await fetch(`/api/events/${rawId}`, { headers });
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
      const user = typeof window !== 'undefined' ? getCurrentUser() : null;
      const headers: Record<string, string> = {};
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete event.');
      }
      setDeleteError(null);
      router.push('/?view=dashboard');
    } catch (err: unknown) {
      console.error(err);
      setDeleteError('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF3C7] p-8 flex flex-col items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-none border-4 border-[#F7418F] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2A0E1C]">Loading celebration details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#FFF3C7] p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-none border border-[#FEC7B4] bg-white p-8 text-center shadow-xs">
          <p className="font-bold text-red-700">{error || 'Event not found.'}</p>
          <Link
            href="/?view=dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white bg-[#F7418F] hover:bg-[#e02b78] px-4 py-2 rounded-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const relativeDate = getRelativeDays(event.event_date);

  const tabs = [
    { id: 'overview', label: 'Overview & Summary', icon: LayoutDashboard, color: 'text-[#F7418F]', badge: undefined },
    { id: 'checklist', label: 'AI Checklist', icon: Sparkles, color: 'text-[#F7418F]', badge: undefined },
    { id: 'budget', label: 'Budget Tracker', icon: IndianRupee, color: 'text-[#F7418F]', badge: formatCurrency(event.total_budget) },
    { id: 'timeline', label: 'Milestones & Timeline', icon: Calendar, color: 'text-[#FC819E]', badge: `${event.milestones_count}` },
    { id: 'vendors', label: 'Vendor Directory', icon: Users, color: 'text-[#F7418F]', badge: `${event.vendors_count}` },
    { id: 'assistant', label: 'AI Planning Concierge', icon: Bot, color: 'text-[#FC819E]', badge: undefined },
  ] as const;

  const tabConfig = {
    overview: {
      title: 'Celebration Overview',
      subtitle: `Key metrics, budget breakdown, and planning progress for ${event.name}.`,
      icon: LayoutDashboard,
      iconColor: 'text-white',
      iconBg: 'bg-[#F7418F]',
      badge: relativeDate.label,
    },
    checklist: {
      title: 'AI Checklist & Roadmap',
      subtitle: 'Tailored celebration milestone checklist, rituals, and ceremony progress.',
      icon: Sparkles,
      iconColor: 'text-white',
      iconBg: 'bg-[#F7418F]',
      badge: undefined,
    },
    budget: {
      title: 'Budget Tracker',
      subtitle: `Allocation envelopes and expense tracking for your ${formatCurrency(event.total_budget)} target.`,
      icon: IndianRupee,
      iconColor: 'text-white',
      iconBg: 'bg-[#F7418F]',
      badge: formatCurrency(event.total_budget),
    },
    timeline: {
      title: 'Milestones & Timeline',
      subtitle: `${event.milestones_count} celebration milestones scheduled for ${formatDate(event.event_date)}.`,
      icon: Calendar,
      iconColor: 'text-white',
      iconBg: 'bg-[#F7418F]',
      badge: `${event.milestones_completed}/${event.milestones_count} Done`,
    },
    vendors: {
      title: 'Vendor Directory',
      subtitle: `Catering, decor, venue, and entertainment directory (${event.vendors_count} booked).`,
      icon: Users,
      iconColor: 'text-white',
      iconBg: 'bg-[#F7418F]',
      badge: `${event.vendors_count} Vendors`,
    },
    assistant: {
      title: 'AI Planning Concierge',
      subtitle: `Personalized celebration advice tailored to your ${event.event_type} event.`,
      icon: Bot,
      iconColor: 'text-white',
      iconBg: 'bg-[#F7418F]',
      badge: 'Live',
    },
  }[activeTab];

  const CurrentTabIcon = tabConfig.icon;

  return (
    <div className="min-h-screen bg-[#FFF3C7] text-[#2A0E1C] flex flex-col justify-between">
      {/* Top Header bar */}
      <header className="border-b-2 border-[#FEC7B4] bg-[#FFF3C7] text-[#2A0E1C] sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/?view=dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-[#2A0E1C] hover:text-[#F7418F] transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <Image
                src="/icon.png"
                alt="CelebrateKaro Logo"
                width={28}
                height={28}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-none object-contain shadow-xs border border-[#F7418F] group-hover:scale-105 transition-transform"
              />
              <span className="text-xs sm:text-sm font-bold text-[#2A0E1C] font-headline">
                CelebrateKaro
              </span>
            </Link>
            {/* Event Name Pill: Shown on sm+ desktop; hidden on mobile to eliminate duplicate title above the mobile banner */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-none bg-white border border-[#FEC7B4] text-[11px] sm:text-xs font-semibold text-[#2A0E1C]">
              <span className="w-2 h-2 rounded-none bg-[#F7418F] shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-xs">{event.name}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ─── MOBILE EVENT HEADER & TAB BAR (< md screens) ─── */}
      <div className="md:hidden bg-white border-b border-[#FEC7B4] shadow-xs">
        {/* Compact Event Banner */}
        <div className="px-3.5 py-2.5 bg-[#FFF3C7]/40 border-b border-[#FEC7B4]/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <EventTypeBadge type={event.event_type} />
            <span className="text-xs font-bold text-[#2A0E1C] truncate">{event.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="h-7 px-2 text-[11px] font-bold border-[#FEC7B4] text-[#2A0E1C] rounded-none"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              <span>Edit</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="h-7 px-2 text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 rounded-none shadow-none"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Horizontal scrollable navigation tabs for mobile (AI Concierge is placed on bottom-right corner instead) */}
        <nav aria-label="Event Sections Mobile" className="flex items-center gap-1 overflow-x-auto p-2 scrollbar-none">
          {tabs
            .filter((tab) => tab.id !== 'assistant')
            .map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setPreviousTab(tab.id as typeof previousTab);
                  }}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#F7418F] text-white shadow-xs'
                      : 'bg-[#FFF3C7]/50 text-[#2A0E1C] hover:bg-[#FEC7B4]/40 border border-[#FEC7B4]/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-none text-[9px] font-bold ${
                        active ? 'bg-white text-[#F7418F]' : 'bg-white text-[#2A0E1C] border border-[#FEC7B4]'
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

      {/* ─── SIDEBAR + MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* ─── DESKTOP LEFT SIDEBAR (Unchanged on md and lg, straight square corners) ─── */}
        <aside
          aria-label="Event Sidebar"
          className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-[#FEC7B4] p-5 sm:p-6 flex-col justify-between shrink-0 shadow-xs"
        >
          <div className="space-y-6">
            {/* Event Profile Card */}
            <div className="p-4 rounded-none bg-[#2A0E1C] text-white shadow-xs space-y-3 border-2 border-[#F7418F]">
              <div className="flex items-center justify-between gap-2">
                <EventTypeBadge type={event.event_type} />
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-none inline-flex items-center gap-1 border ${
                    relativeDate.isPast
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-[#F7418F] text-white border-[#F7418F]'
                  }`}
                >
                  <Clock className="w-3 h-3 text-white" />
                  {relativeDate.label}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-bold truncate leading-tight text-white" title={event.name}>
                  {event.name}
                </h2>
                <p className="text-xs text-[#FEC7B4] font-medium leading-tight mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#FC819E]" />
                  {formatDate(event.event_date)}
                </p>
              </div>
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#FEC7B4] font-medium">
                <span>Budget</span>
                <span className="text-[#FC819E] font-bold">
                  {formatCurrency(event.total_budget)}
                </span>
              </div>
            </div>

            {/* Vertical Navigation Tabs */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A0E1C]/60 px-3 block mb-2">
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
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        if (tab.id !== 'assistant') setPreviousTab(tab.id as typeof previousTab);
                      }}
                      aria-pressed={active}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#F7418F] text-white shadow-xs'
                          : 'text-[#2A0E1C] hover:bg-[#FEC7B4]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : tab.color}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-none text-[10px] font-bold shrink-0 ${
                            active ? 'bg-white text-[#F7418F]' : 'bg-[#FFF3C7] text-[#2A0E1C] border border-[#FEC7B4]'
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
          </div>

          {/* Sidebar Bottom Back Link */}
          <div className="pt-6 mt-6 border-t border-[#FEC7B4]">
            <Link
              href="/?view=dashboard"
              className="text-xs font-bold text-[#2A0E1C] hover:text-[#F7418F] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#F7418F]" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </aside>

        {/* ─── MAIN CONTENT PANE ─── */}
        <main className={`flex-1 overflow-y-auto max-w-7xl ${activeTab === 'assistant' ? 'p-2.5 sm:p-5 lg:p-6 space-y-0' : 'p-4 sm:p-8 lg:p-10 space-y-6'}`}>
          {/* Mobile-only header when inside AI Concierge chat */}
          {activeTab === 'assistant' && (
            <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#FEC7B4] mb-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-none bg-[#F7418F] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#2A0E1C]">AI Concierge</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab(previousTab)}
                className="text-xs font-bold text-[#F7418F] hover:bg-[#FEC7B4]/30 px-2.5 py-1 rounded-none border border-[#FC819E] flex items-center gap-1 cursor-pointer transition-colors"
              >
                ← Back to {tabs.find((t) => t.id === previousTab)?.label.split(' ')[0] || 'Overview'}
              </button>
            </div>
          )}

          {/* Top Bar: Displays Active Section with Quick Actions (hidden for AI Concierge to show chat immediately) */}
          {activeTab !== 'assistant' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#FEC7B4] pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-none flex items-center justify-center shrink-0 ${tabConfig.iconBg}`}>
                  <CurrentTabIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${tabConfig.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#2A0E1C] font-headline">
                      {tabConfig.title}
                    </h1>
                    {tabConfig.badge && (
                      <span className="px-2 py-0.5 rounded-none text-[11px] sm:text-xs font-bold bg-[#FEC7B4] text-[#F7418F] border border-[#FC819E]">
                        {tabConfig.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#2A0E1C]/75 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
                    {tabConfig.subtitle}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons (hidden on mobile since shown in mobile header) */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1.5 text-xs font-bold border-[#FEC7B4] text-[#2A0E1C] hover:bg-[#FEC7B4]/50 rounded-none cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 rounded-none shadow-none cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          )}

          {/* ─── PAST CELEBRATION WRAP-UP BANNER ─── */}
          {relativeDate.isPast && (
            <section
              aria-label="Celebration Concluded Wrap-Up"
              className="rounded-none border-2 border-emerald-400/80 bg-gradient-to-r from-emerald-50/90 via-[#FFF3C7]/80 to-white p-4 sm:p-5 shadow-xs mb-6 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-none bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    🎉
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-[#2A0E1C] font-headline">
                        Celebration Successfully Concluded!
                      </h2>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-none bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {relativeDate.label}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2A0E1C]/80 mt-1 max-w-2xl leading-relaxed">
                      Held on <strong>{formatDate(event.event_date)}</strong>. All budget expenditures ({formatCurrency(event.total_budget)} target), vendor connections ({event.vendors_count} booked), and timeline milestones are safely preserved in your archive.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="rounded-none font-bold text-xs bg-[#F7418F] hover:bg-[#e02b78] text-white cursor-pointer shadow-xs border border-[#F7418F] flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reschedule / Next Edition</span>
                  </Button>
                  {activeTab !== 'assistant' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('assistant')}
                      className="rounded-none font-bold text-xs border-[#FEC7B4] text-[#2A0E1C] hover:bg-white cursor-pointer flex items-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#F7418F]" />
                      <span>Wrap-Up Concierge</span>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Active Section Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Event Overview Hero Card */}
              <section
                aria-labelledby="event-hero-title"
                className="rounded-none border border-[#FEC7B4] bg-white p-4 sm:p-8 shadow-xs relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <EventTypeBadge type={event.event_type} />
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-none inline-flex items-center gap-1 border ${
                      relativeDate.isPast
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-[#FEC7B4] text-[#F7418F] border-[#FC819E]'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-[#F7418F]" />
                    {relativeDate.label}
                  </span>
                </div>

                <h2 id="event-hero-title" className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#2A0E1C] font-headline">
                  {event.name}
                </h2>

                {event.description && (
                  <p className="mt-2 text-xs sm:text-base text-[#2A0E1C]/80 max-w-3xl leading-relaxed font-normal">
                    {event.description}
                  </p>
                )}

                {/* Metrics Row */}
                <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 border-t border-[#FEC7B4] pt-5 sm:pt-6">
                  <div className="p-3 sm:p-3.5 rounded-none bg-[#FFF3C7]/50 border border-[#FEC7B4]">
                    <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F7418F]" />
                      Date
                    </span>
                    <p className="mt-1 text-xs sm:text-base font-bold text-[#2A0E1C] truncate" title={formatDate(event.event_date)}>
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-none bg-[#FFF3C7]/50 border border-[#FEC7B4]">
                    <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-[#F7418F]" />
                      Budget
                    </span>
                    <p className="mt-1 text-xs sm:text-base font-bold text-[#2A0E1C] truncate" title={formatCurrency(event.total_budget)}>
                      {formatCurrency(event.total_budget)}
                    </p>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-none bg-[#FFF3C7]/50 border border-[#FEC7B4]">
                    <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#FC819E]" />
                      Guests
                    </span>
                    <p className="mt-1 text-xs sm:text-base font-bold text-[#2A0E1C]">
                      {event.guest_count.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-none bg-[#FFF3C7]/50 border border-[#FEC7B4]">
                    <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F7418F]" />
                      Status
                    </span>
                    <p className="mt-1 text-xs sm:text-base font-bold text-[#2A0E1C] truncate">
                      {relativeDate.isPast ? 'Completed' : 'Active'}
                    </p>
                  </div>
                </div>
              </section>

              {/* The 3 High-Contrast Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Budget Status Card */}
                <Card className="rounded-none border border-[#FEC7B4] bg-white shadow-xs hover:border-[#F7418F] transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2.5 text-[#2A0E1C]">
                      <div className="w-9 h-9 rounded-none bg-[#FEC7B4] flex items-center justify-center text-[#F7418F]">
                        <IndianRupee className="w-4 h-4 text-[#F7418F]" />
                      </div>
                      <span>Budget Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tracking-tight text-[#2A0E1C]">
                      {formatCurrency(event.total_budget)}
                    </p>
                    <p className="mt-1 text-xs text-[#2A0E1C]/75 font-medium">
                      {event.total_planned_budget > 0
                        ? `${formatCurrency(event.total_planned_budget)} planned across categories`
                        : 'No category breakdown configured yet.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('budget')}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#F7418F] bg-[#FEC7B4]/40 hover:bg-[#FEC7B4] px-3 py-1.5 rounded-none cursor-pointer transition-colors border border-[#FC819E]"
                    >
                      <span>Manage Budget Categories</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F7418F]" />
                    </button>
                  </CardContent>
                </Card>

                {/* Timeline & Deadlines Card */}
                <Card className="rounded-none border border-[#FEC7B4] bg-white shadow-xs hover:border-[#F7418F] transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2.5 text-[#2A0E1C]">
                      <div className="w-9 h-9 rounded-none bg-[#FEC7B4] flex items-center justify-center text-[#F7418F]">
                        <Calendar className="w-4 h-4 text-[#F7418F]" />
                      </div>
                      <span>Timeline &amp; Deadlines</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tracking-tight text-[#2A0E1C]">
                      {event.milestones_count} Milestones
                    </p>
                    <p className="mt-1 text-xs text-[#2A0E1C]/75 font-medium">
                      {event.milestones_completed} completed so far
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('timeline')}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#F7418F] bg-[#FEC7B4]/40 hover:bg-[#FEC7B4] px-3 py-1.5 rounded-none cursor-pointer transition-colors border border-[#FC819E]"
                    >
                      <span>View Timeline Milestones</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F7418F]" />
                    </button>
                  </CardContent>
                </Card>

                {/* Vendor Checklist Card */}
                <Card className="rounded-none border border-[#FEC7B4] bg-white shadow-xs hover:border-[#F7418F] transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2.5 text-[#2A0E1C]">
                      <div className="w-9 h-9 rounded-none bg-[#FEC7B4] flex items-center justify-center text-[#F7418F]">
                        <Users className="w-4 h-4 text-[#F7418F]" />
                      </div>
                      <span>Vendor Directory</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tracking-tight text-[#2A0E1C]">
                      {event.vendors_count} Vendors
                    </p>
                    <p className="mt-1 text-xs text-[#2A0E1C]/75 font-medium">
                      Track inquiries, quotes, and booked contracts
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vendors')}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#F7418F] bg-[#FEC7B4]/40 hover:bg-[#FEC7B4] px-3 py-1.5 rounded-none cursor-pointer transition-colors border border-[#FC819E]"
                    >
                      <span>Open Vendor Checklist</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F7418F]" />
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant Callout */}
              <div className="rounded-none border-2 border-[#F7418F] bg-[#2A0E1C] p-6 sm:p-8 text-white shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 rounded-none bg-[#F7418F] px-3 py-1 text-xs font-bold text-white">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      AI Planning Concierge
                    </span>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-white font-headline">
                      Generate personalized recommendations for {event.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#FEC7B4] leading-relaxed">
                      The AI Assistant will tailor recommendations to your {event.event_type} celebration with {event.guest_count} guests and a {formatCurrency(event.total_budget)} budget.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('assistant')}
                    variant="default"
                    className="gap-2 bg-[#F7418F] hover:bg-[#e02b78] text-white font-bold rounded-none shadow-xs shrink-0 cursor-pointer border border-[#F7418F]"
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
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />

      {/* ─── MOBILE-ONLY FLOATING AI CONCIERGE BUBBLE (Bottom-Right Corner) ─── */}
      {currentUser && (
        <div className="fixed bottom-6 right-5 z-40 md:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'assistant') {
                setActiveTab(previousTab);
              } else {
                setPreviousTab(activeTab);
                setActiveTab('assistant');
              }
            }}
            aria-label={activeTab === 'assistant' ? 'Close AI Assistant Concierge' : 'Open AI Planning Concierge'}
            className={`h-14 w-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(247,65,143,0.5)] border-2 border-white transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'assistant'
                ? 'bg-[#2A0E1C] text-white hover:bg-[#3d1428]'
                : 'bg-[#F7418F] hover:bg-[#e02b78] text-white'
            }`}
          >
            {activeTab === 'assistant' ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFF3C7] border-2 border-[#F7418F]" />
              </div>
            )}
          </button>
        </div>
      )}

      <InspoFooter />
    </div>
  );
}
