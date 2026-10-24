'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { EventType, User } from '@/types';
import type { EventWithStats } from '@/lib/events';
import { EventCard } from '@/components/events/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/events/DeleteConfirmModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { InteractiveShowcase } from '@/components/landing/InteractiveShowcase';
import { AestheticIllustration } from '@/components/landing/AestheticIllustration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/card';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/formatters';
import {
  getCurrentUser,
  logoutUser,
  subscribeToAuthChanges,
} from '@/lib/auth';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Plus,
  LogOut,
  CalendarDays,
  Clock,
  ClipboardList,
  Bot,
  Mail,
} from 'lucide-react';

export default function HomePage() {
  // Navigation View State: 'landing' (default for guests) or 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'register'>('signin');

  // Events & Dashboard State
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Real-time pulse state
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState(false);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  }, []);

  // Check URL query parameters on initial mount (e.g. ?view=dashboard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'dashboard') {
        setViewMode('dashboard');
      }
    }
  }, []);

  // Subscribe to real-time auth changes across tabs
  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch events from API with real-time tracking
  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load celebrations.');
      }
      setEvents(json.data);
      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: unknown) {
      console.error(err);
      if (!silent) {
        setError('Could not connect to the database. Please refresh to try again.');
      }
    } finally {
      if (!silent) setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Real-time background sync polling every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchEvents(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchEvents]);

  // Filtered events
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

  const handleEventCreated = () => {
    showNotification('Celebration created successfully! Synthesizing checklist and budget roadmap.');
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

  const handleOpenAuth = (tab: 'signin' | 'register') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User, action: 'login' | 'register') => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setViewMode('dashboard');

    if (action === 'register') {
      showNotification(`Welcome to Celebration Planner, ${user.name}! Your workspace is ready.`);
    } else {
      showNotification(`Welcome back, ${user.name}! Navigated to your dashboard.`);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setViewMode('landing');
    showNotification('You have been logged out.');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-zinc-900 focus:shadow-lg dark:focus:bg-zinc-900"
      >
        Skip to main content
      </a>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  HEADER NAVBAR: Frosted Glass, Brand Logo, Nav Pills & Auth   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Brand Logo & View Switcher */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  CelebratePro
                  <Badge variant="outline" className="text-[10px] font-semibold py-0 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-900/50">
                    ✨ Event Studio
                  </Badge>
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block leading-tight">
                  Celebration & Event Planning Studio
                </span>
              </div>
            </Link>

            {/* Navigation View Switcher Tabs */}
            <TabsList className="hidden md:inline-flex">
              <TabsTrigger
                active={viewMode === 'landing'}
                onClick={() => setViewMode('landing')}
              >
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                active={viewMode === 'dashboard'}
                onClick={() => {
                  if (!currentUser) {
                    handleOpenAuth('signin');
                  } else {
                    setViewMode('dashboard');
                  }
                }}
              >
                <span>Dashboard</span>
                {events.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-zinc-200/80 px-1.5 py-0.2 text-[10px] font-bold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                    {events.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TOP RIGHT CORNER: Live Sync Indicator & Production Auth */}
          <div className="flex items-center gap-3">
            {/* Real-Time Live Status Pill */}
            <div
              title={`Live real-time sync active (Last sync: ${lastSyncedTime})`}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400"
            >
              <span className={`h-2 w-2 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : 'animate-pulse'}`} />
              <span>Real-Time Live</span>
            </div>

            {/* When USER IS LOGGED OUT: Sign In & Register */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAuth('signin')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleOpenAuth('register')}
                >
                  Register Free
                </Button>
              </div>
            ) : (
              /* When USER IS LOGGED IN: Profile Chip, Dashboard Action, Log Out */
              <div className="flex items-center gap-2">
                {/* User Profile Chip */}
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/70 pl-2 pr-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${currentUser.avatarColor} text-white font-bold text-[11px]`}>
                    {currentUser.name[0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
                      {currentUser.roleLabel}
                    </p>
                  </div>
                </div>

                {/* Dashboard Action Button */}
                {viewMode === 'landing' ? (
                  <Button
                    size="sm"
                    onClick={() => setViewMode('dashboard')}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Celebration</span>
                  </Button>
                )}

                {/* Sign Out Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  MAIN CONTENT CONTAINER                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1">
        {/* Global Toast Notification */}
        {notification && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3">
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-between rounded-xl bg-zinc-900 text-white px-4 py-2.5 text-xs sm:text-sm font-medium dark:bg-zinc-100 dark:text-zinc-900 shadow-md animate-in slide-in-from-top-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="opacity-70 hover:opacity-100 ml-3"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  VIEW 1: CLEAN, AESTHETIC MARKETING LANDING PAGE           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'landing' ? (
          <div>
            {/* HERO SECTION with Aesthetic Dual-Column Illustration */}
            <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-amber-50/50 via-rose-50/25 to-transparent dark:from-zinc-900/40 dark:via-transparent dark:to-transparent">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Column: Typography, Value Proposition, CTAs */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/70 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>The Modern Way to Plan Extraordinary Moments</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
                      Where unforgettable celebrations{' '}
                      <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
                        come to life.
                      </span>
                    </h1>

                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                      From dream weddings and milestone birthdays to grand galas — seamlessly orchestrate every detail. Track budgets with clarity, customize intelligent checklists, coordinate vendors, and countdown milestones with total peace of mind.
                    </p>

                    {/* Hero Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {!currentUser ? (
                        <>
                          <Button
                            size="lg"
                            onClick={() => handleOpenAuth('register')}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          >
                            <span>Get Started Free</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleOpenAuth('signin')}
                          >
                            <span>Sign In to Dashboard</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="lg"
                          onClick={() => setViewMode('dashboard')}
                        >
                          <span>Open My Dashboard ({events.length} Events)</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Celebratory Metrics Row */}
                    <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-200/70 dark:border-zinc-800/70">
                      <div>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">All-in-One</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Weddings & Galas</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">Budget Clarity</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Envelopes & Alerts</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-500 tracking-tight">Curated</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Checklists & Timelines</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-violet-600 dark:text-violet-400 tracking-tight">Zero Stress</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Concierge & CRM</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Aesthetic Celebration Illustration */}
                  <div className="lg:col-span-5 flex justify-center">
                    <AestheticIllustration />
                  </div>
                </div>
              </div>
            </section>

            {/* PRODUCT CAPABILITY SHOWCASE */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-10 space-y-2">
                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-900/60">
                  The Planning Suite
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Every detail of your special day, handled with care
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
                  Explore the suite of thoughtful tools designed to make celebration planning joyful and stress-free.
                </p>
              </div>

              <InteractiveShowcase />
            </section>

            {/* 6 CORE PILLARS BENTO GRID */}
            <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-rose-700 border-rose-200 dark:text-rose-400 dark:border-rose-900/60">
                  Core Capabilities
                </Badge>
                <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Designed for couples, hosts, and celebration planners
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
                    title: 'Curated Planning Checklists',
                    desc: 'Actionable milestones tailored to your guest scale, budget, and celebration theme — from 12 months out to day-of coordination.',
                    tag: 'Personalized',
                  },
                  {
                    icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
                    title: 'Precision Budget Envelopes',
                    desc: 'Allocate spending envelopes for venue, catering, floral, and music with real-time balance calculations so you never overspend.',
                    tag: 'Financial Peace',
                  },
                  {
                    icon: <Clock className="h-5 w-5 text-rose-500" />,
                    title: 'Milestone Countdowns',
                    desc: 'Clear, chronological countdowns so tastings, attire fittings, invitations, and deposits happen smoothly on schedule.',
                    tag: 'Timelines',
                  },
                  {
                    icon: <ClipboardList className="h-5 w-5 text-sky-500" />,
                    title: 'Vendor Directory & CRM',
                    desc: 'Organize caterers, florists, photographers, and venues across inquiries, quotes, confirmed contracts, and payments.',
                    tag: 'Vendor Rolodex',
                  },
                  {
                    icon: <Bot className="h-5 w-5 text-violet-500" />,
                    title: 'AI Planning Concierge',
                    desc: 'Get friendly, personalized advice on seating arrangements, etiquette, menu alternatives, and creative theme accents.',
                    tag: '24/7 Guidance',
                  },
                  {
                    icon: <Mail className="h-5 w-5 text-pink-500" />,
                    title: 'Vendor Email Assistant',
                    desc: 'Draft courteous, polished inquiry letters, quote requests, and tasting bookings to vendors with a single click.',
                    tag: 'Outreach',
                  },
                ].map((feature, i) => (
                  <Card
                    key={i}
                    className="p-6 hover:border-zinc-400/80 dark:hover:border-zinc-700 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        {feature.icon}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                        {feature.tag}
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                  Three-Step Flow
                </Badge>
                <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  How celebration planning works
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900">
                    1
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-white">
                    Create Your Celebration
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Input your event type (Wedding, Birthday, Community, or other), target date, guest count, and initial budget.
                  </p>
                </Card>

                <Card className="p-6 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900">
                    2
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-white">
                    Personalized Planning Roadmap
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Get an intelligent checklist, recommended budget allocation, and milestone countdown roadmap tailored to your event scale.
                  </p>
                </Card>

                <Card className="p-6 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900">
                    3
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-white">
                    Coordinate & Celebrate
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Track vendor quotes, draft outreach emails, converse with your planning concierge, and watch your dream celebration come together.
                  </p>
                </Card>
              </div>
            </section>

            {/* CALL TO ACTION BANNER */}
            <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
              <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center text-white shadow-xl dark:border-zinc-800">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Ready to plan your dream celebration?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-zinc-300">
                  Experience the calm of organized, elegant event planning with live real-time coordination.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {!currentUser ? (
                    <Button
                      size="lg"
                      onClick={() => handleOpenAuth('register')}
                      className="bg-white text-zinc-900 hover:bg-zinc-100"
                    >
                      <span>Create Free Account & Go to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => setViewMode('dashboard')}
                      className="bg-white text-zinc-900 hover:bg-zinc-100"
                    >
                      <span>Open My Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════ */
          /*  VIEW 2: FULL WORKING PLANNER DASHBOARD                     */
          /* ═══════════════════════════════════════════════════════════ */
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Sub-Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/70 pb-5 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    Celebrations Workspace
                  </h2>
                  <Badge variant="secondary" className="font-bold">
                    {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {currentUser ? (
                    <span>
                      Active User: <strong className="text-zinc-800 dark:text-zinc-200">{currentUser.name}</strong> ({currentUser.roleLabel}) • Real-time database synced
                    </span>
                  ) : (
                    <span>Private celebrations workspace • Live updates & smart planning assistance</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEvents()}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Plan Celebration</span>
                </Button>
              </div>
            </div>

            {/* Dashboard Overview Cards */}
            <section aria-labelledby="stats-heading" className="mb-8">
              <h3 id="stats-heading" className="sr-only">
                Event Planning Statistics
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Celebrations</span>
                    <Calendar className="h-4 w-4 text-zinc-400" />
                  </div>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {stats.totalEvents}
                  </p>
                  <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {stats.upcomingCount} upcoming
                  </span>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Budget Managed</span>
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {formatCurrency(stats.totalBudget)}
                  </p>
                  <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Tracked in real-time
                  </span>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Expected Guests</span>
                    <Users className="h-4 w-4 text-zinc-400" />
                  </div>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {stats.totalGuests.toLocaleString()}
                  </p>
                  <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Across all events</span>
                </Card>

                <Card className="p-5 border-violet-200/70 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">GenAI Assistant</span>
                    <Sparkles className="h-4 w-4 text-violet-600" />
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Ready to synthesize custom vendor checklists and timelines.
                  </p>
                  <span className="mt-2 inline-block text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {filteredEvents.length > 0 ? 'Select an event below' : 'Create an event to start'}
                  </span>
                </Card>
              </div>
            </section>

            {/* Filter Pills */}
            <section aria-labelledby="filter-heading" className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h3 id="filter-heading" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Your Celebrations
              </h3>

              <div
                role="toolbar"
                aria-label="Filter events by category"
                className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs"
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
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-zinc-900 text-white shadow-2xs dark:bg-zinc-100 dark:text-zinc-900'
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => fetchEvents()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <CalendarDays className="h-7 w-7 text-zinc-400" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activeFilter === 'all'
                    ? 'No celebrations created yet'
                    : `No ${activeFilter} celebrations found`}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                  Create your celebration to get personalized planning checklists, milestone countdowns, and precision budget tracking.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Plan Your First Celebration</span>
                  </Button>
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
          </div>
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  FOOTER                                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200/80 bg-white py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CelebratePro. Crafted with elegance for weddings, birthdays, galas, and life&apos;s memorable moments.</p>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>💍 Weddings</span>
            <span>•</span>
            <span>🎂 Birthdays & Galas</span>
            <span>•</span>
            <span>🏘️ Community Gatherings</span>
            <span>•</span>
            <span>Private Events</span>
          </div>
        </div>
      </footer>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  MODALS                                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Create Event Modal */}
      <EventFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleEventCreated}
      />

      {/* Delete Event Modal */}
      <DeleteConfirmModal
        isOpen={!!eventToDelete}
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Clean Production Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
