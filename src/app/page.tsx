'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { EventType, User } from '@/types';
import type { EventWithStats } from '@/lib/events';
import { EventCard } from '@/components/events/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/events/DeleteConfirmModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { InspoHero } from '@/components/landing/InspoHero';
import { HowItWorksInspo } from '@/components/landing/HowItWorksInspo';
import { CelebrationsCarousel } from '@/components/landing/CelebrationsCarousel';
import { LovedByHosts } from '@/components/landing/LovedByHosts';
import { InspoFinalCTA } from '@/components/landing/InspoFinalCTA';
import { InspoFooter } from '@/components/landing/InspoFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/card';
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

  // Sync state
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
      {/*  HEADER NAVBAR: Inspo Deep Evergreen & Mint Accents          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#073330] text-white transition-all shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e599] text-[#073330] shadow-sm group-hover:scale-105 transition-transform font-black">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  CelebratePro
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00e599]/20 text-[#00e599]">
                    Studio
                  </span>
                </span>
                <span className="text-[11px] text-slate-300 block leading-tight font-medium">
                  Celebration & Event Planning
                </span>
              </div>
            </Link>
          </div>

          {/* TOP RIGHT CORNER: Production Auth Controls */}
          <div className="flex items-center gap-3">
            {/* When USER IS LOGGED OUT: Sign In & Register */}
            {!currentUser ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAuth('signin')}
                  className="text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => handleOpenAuth('register')}
                  className="rounded-full px-5 py-2 font-black cursor-pointer text-[#073330] bg-[#00e599] hover:bg-[#1cf3a6] shadow-md uppercase text-xs tracking-wider"
                >
                  Get Started →
                </Button>
              </div>
            ) : (
              /* When USER IS LOGGED IN: Profile Chip, Dashboard Action, Log Out */
              <div className="flex items-center gap-2">
                {/* User Profile Chip */}
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 pl-2 pr-3 py-1 text-white">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${currentUser.avatarColor} text-white font-bold text-[11px]`}>
                    {currentUser.name[0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-white truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      {currentUser.roleLabel}
                    </p>
                  </div>
                </div>

                {/* Dashboard Action Button */}
                {viewMode === 'landing' ? (
                  <Button
                    size="sm"
                    variant="mint"
                    onClick={() => setViewMode('dashboard')}
                    className="cursor-pointer rounded-full text-[#073330] font-bold"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('landing')}
                      className="hidden sm:inline-flex text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <span>Home</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="mint"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="cursor-pointer rounded-full text-[#073330] font-bold"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>New Celebration</span>
                    </Button>
                  </div>
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
          <div className="pb-0 bg-[#faf8f4]">
            {/* 1. INSPO HERO SECTION (Deep Evergreen, Mint CTA, Tilted Photo Collage, Press Strip) */}
            <InspoHero
              onStartPlanning={() => handleOpenAuth('register')}
              isLoggedIn={!!currentUser}
              onOpenDashboard={() => setViewMode('dashboard')}
              eventsCount={events.length}
            />

            {/* 2. HOW CELEBRATEPRO WORKS (Scenic Terrace, 3 Illustrated Cards, Overlapping Lime Banner) */}
            <HowItWorksInspo
              onStartPlanning={() => handleOpenAuth('register')}
            />

            {/* 3. REAL CELEBRATIONS CAROUSEL (Real Photos, Peach Badges, Circular Navigation) */}
            <CelebrationsCarousel
              onSelectEvent={() => handleOpenAuth('register')}
            />

            {/* 4. LOVED BY OVER 5,000+ HOSTS (Warm Cream Testimonial Cards & Whimsical Details) */}
            <LovedByHosts />

            {/* 5. INSPO FINAL CTA BANNER (Sky-Blue Container with Whimsical Illustrated Host & Cat) */}
            <InspoFinalCTA
              onStartPlanning={() => handleOpenAuth('register')}
              isLoggedIn={!!currentUser}
              onOpenDashboard={() => setViewMode('dashboard')}
            />
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
                      Active User: <strong className="text-zinc-800 dark:text-zinc-200">{currentUser.name}</strong> ({currentUser.roleLabel}) • Database synced
                    </span>
                  ) : (
                    <span>Private celebrations workspace • Dedicated planning assistance</span>
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
                    Across active celebrations
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
      {/*  FOOTER (Clean Evergreen Inspo Footer)                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <InspoFooter />

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
