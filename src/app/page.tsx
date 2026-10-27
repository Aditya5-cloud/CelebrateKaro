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
  ArrowRight,
  RefreshCw,
  Plus,
  LogOut,
  CalendarDays,
  Heart,
  Cake,
  Wine,
  PartyPopper,
  Home,
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

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronize view mode with URL query params (e.g. ?view=dashboard) and back navigation
  useEffect(() => {
    const checkView = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        if (view === 'dashboard') {
          setViewMode('dashboard');
        } else if (view === 'landing') {
          setViewMode('landing');
        }
      }
    };

    checkView();
    window.addEventListener('popstate', checkView);
    return () => window.removeEventListener('popstate', checkView);
  }, []);

  // Subscribe to real-time auth changes across tabs
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') !== 'landing') {
        setViewMode('dashboard');
      }
    }
    const unsubscribe = subscribeToAuthChanges((newUser) => {
      setCurrentUser(newUser);
      if (newUser && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') !== 'landing') {
          setViewMode('dashboard');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch events from API with real-time tracking for the active user
  const fetchEvents = useCallback(async (targetUserId?: string | null, silent = false) => {
    if (!silent) setIsLoading(true);
    setIsSyncing(true);
    setError(null);
    try {
      const activeUser = targetUserId !== undefined ? targetUserId : (currentUser?.id ?? getCurrentUser()?.id ?? null);
      let url = '/api/events';
      const headers: Record<string, string> = {};
      if (activeUser) {
        url += `?userId=${encodeURIComponent(activeUser)}`;
        headers['x-user-id'] = activeUser;
      }
      const res = await fetch(url, { headers });
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
  }, [currentUser]);

  useEffect(() => {
    fetchEvents(currentUser ? currentUser.id : null);
  }, [fetchEvents, currentUser]);

  // Real-time background sync polling every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchEvents(currentUser ? currentUser.id : null, true);
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchEvents, currentUser]);

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
    fetchEvents(currentUser?.id);
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
      fetchEvents(currentUser?.id);
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

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setViewMode('dashboard');
    fetchEvents(user.id);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setEvents([]);
    setViewMode('landing');
    fetchEvents(null);
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
      {/*  HEADER NAVBAR: Royal Indian Palette & Saffron Accents         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#1E1B4B] text-white transition-all shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.png"
                alt="CelebrateKaro Logo"
                className="h-9 w-9 rounded-xl object-contain shadow-sm border border-amber-400/30 group-hover:scale-105 transition-transform shrink-0"
              />
              <div>
                <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-headline">
                  CelebrateKaro
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-body">
                    AI Studio
                  </span>
                </span>
                <span className="text-[11px] text-amber-200/80 block leading-tight font-medium font-body">
                  AI Celebration & Event Planner
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
                  className="text-amber-100 hover:text-white hover:bg-white/10 cursor-pointer font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  variant="saffron"
                  size="sm"
                  onClick={() => handleOpenAuth('register')}
                  className="rounded-full px-5 py-2 font-black cursor-pointer text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-md uppercase text-xs tracking-wider"
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
                    <p className="text-[10px] text-amber-200 leading-tight">
                      {currentUser.roleLabel}
                    </p>
                  </div>
                </div>

                {/* Dashboard Action Button */}
                {viewMode === 'landing' ? (
                  <Button
                    size="sm"
                    variant="saffron"
                    onClick={() => setViewMode('dashboard')}
                    className="cursor-pointer rounded-full text-[#1E1B4B] font-bold bg-amber-400 hover:bg-amber-300"
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
                      className="hidden sm:inline-flex text-amber-100 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <span>Home</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="saffron"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="cursor-pointer rounded-full text-[#1E1B4B] font-bold bg-amber-400 hover:bg-amber-300"
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
                  className="text-amber-200 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
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
        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  VIEW 1: CLEAN, AESTHETIC MARKETING LANDING PAGE           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'landing' ? (
          <div className="pb-0 bg-[#FAF6EF]">
            {/* 1. INSPO HERO SECTION */}
            <InspoHero
              onStartPlanning={() => handleOpenAuth('register')}
              isLoggedIn={!!currentUser}
              onOpenDashboard={() => setViewMode('dashboard')}
              eventsCount={events.length}
            />

            {/* 2. HOW CELEBRATEKARO WORKS */}
            <HowItWorksInspo
              onStartPlanning={() => handleOpenAuth('register')}
            />

            {/* 3. REAL CELEBRATIONS CAROUSEL */}
            <CelebrationsCarousel
              onSelectEvent={() => handleOpenAuth('register')}
            />

            {/* 4. LOVED BY OVER 5,000+ INDIAN HOSTS */}
            <LovedByHosts />

            {/* 5. FINAL CELEBRATEKARO CTA BANNER */}
            <InspoFinalCTA
              onStartPlanning={() => handleOpenAuth('register')}
              isLoggedIn={!!currentUser}
              onOpenDashboard={() => setViewMode('dashboard')}
            />
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════ */
          /*  VIEW 2: FULL WORKING PLANNER DASHBOARD WITH SIDEBAR         */
          /* ═══════════════════════════════════════════════════════════ */
          <div className="min-h-[calc(100vh-64px)] bg-[#FAF6EF] text-[#1E1B4B] flex flex-col md:flex-row">
            {/* ─── LEFT SIDEBAR ─── */}
            <aside aria-label="Dashboard Sidebar" className="w-full md:w-64 lg:w-72 bg-white border-r border-amber-900/10 p-5 sm:p-6 flex flex-col justify-between shrink-0 shadow-xs">
              <div className="space-y-6">
                {/* User / Workspace Profile Card */}
                <div className="p-4 rounded-2xl bg-[#161233] text-white shadow-sm space-y-3 border border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${currentUser?.avatarColor || 'bg-amber-500 text-[#1E1B4B]'} text-white font-black text-sm shadow-xs`}>
                      {currentUser ? currentUser.name[0] : 'C'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate leading-tight text-white">
                        {currentUser ? currentUser.name : 'Celebration Host'}
                      </p>
                      <p className="text-xs text-amber-300 font-semibold leading-tight mt-0.5">
                        {currentUser ? currentUser.roleLabel : 'Planner'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200 font-medium">
                    <span>Database</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Synced
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <Button
                  variant="saffron"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full h-11 rounded-full font-black text-xs uppercase tracking-wider text-[#1E1B4B] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Plan Celebration</span>
                </Button>

                {/* Navigation / Filter Categories in Sidebar */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-3 block mb-2">
                    Celebration Categories
                  </span>
                  {[
                    { id: 'all', label: 'All Celebrations', icon: Sparkles, iconColor: 'text-amber-500' },
                    { id: 'wedding', label: '💍 Shaadi & Vivah', icon: Heart, iconColor: 'text-rose-500' },
                    { id: 'birthday', label: '🎂 Janamdin', icon: Cake, iconColor: 'text-amber-600' },
                    { id: 'community', label: '🍲 Bhandara & Mela', icon: Wine, iconColor: 'text-orange-600' },
                    { id: 'other', label: '🎉 Festive Socials', icon: PartyPopper, iconColor: 'text-purple-600' },
                  ].map((tab) => {
                    const active = activeFilter === tab.id;
                    const count = tab.id === 'all'
                      ? events.length
                      : events.filter(e => e.event_type === tab.id).length;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFilter(tab.id as EventType | 'all')}
                        aria-pressed={active}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#1E1B4B] text-white shadow-xs'
                            : 'text-stone-700 hover:bg-amber-50 hover:text-[#1E1B4B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-300' : tab.iconColor}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          active ? 'bg-amber-400 text-[#1E1B4B]' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Bottom: Back to Landing Page & Sign Out */}
              <div className="pt-6 mt-6 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('landing')}
                  className="text-xs font-bold text-stone-600 hover:text-[#1E1B4B] flex items-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-[#1E1B4B]" />
                  <span>Home</span>
                </button>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </aside>

            {/* ─── MAIN CONTENT AREA ─── */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 overflow-y-auto max-w-7xl">
              {/* Header inside main area */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1B4B] font-headline">
                      CelebrateKaro Workspace
                    </h2>
                    <Badge variant="secondary" className="font-bold bg-amber-100 text-[#1E1B4B] border border-amber-300 font-body">
                      {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium font-body">
                    {currentUser ? (
                      <span>
                        Active Host: <strong className="text-[#1E1B4B]">{currentUser.name}</strong> ({currentUser.roleLabel}) • Database synced • Tayaari on track
                      </span>
                    ) : (
                      <span>Private celebrations workspace • Dedicated AI planning assistance</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchEvents()}
                    disabled={isSyncing}
                    className="border-stone-300 text-[#1E1B4B] hover:bg-amber-50 rounded-xl font-bold cursor-pointer font-body"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </Button>
                </div>
              </div>

              {/* Dashboard Overview Cards */}
              <section aria-labelledby="stats-heading">
                <h3 id="stats-heading" className="sr-only">
                  Event Planning Statistics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl border border-amber-900/10 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-body">Total Celebrations</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-[#1E1B4B]">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#1E1B4B] tabular-nums font-headline">
                      {stats.totalEvents}
                    </p>
                    <span className="mt-1 text-xs text-stone-500 font-medium block font-body">
                      {stats.upcomingCount} upcoming
                    </span>
                  </div>

                  <div className="p-5 rounded-3xl border border-amber-900/10 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-body">Total Budget Managed</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                        <DollarSign className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#1E1B4B] tabular-nums font-headline">
                      {formatCurrency(stats.totalBudget)}
                    </p>
                    <span className="mt-1 text-xs text-emerald-700 font-bold block font-body">
                      Across active celebrations
                    </span>
                  </div>

                  <div className="p-5 rounded-3xl border border-amber-900/10 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-body">Total Expected Guests</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#1E1B4B] tabular-nums font-headline">
                      {stats.totalGuests.toLocaleString()}
                    </p>
                    <span className="mt-1 text-xs text-stone-500 font-medium block font-body">Across all events</span>
                  </div>

                  <div className="p-5 rounded-3xl border border-amber-400/40 bg-amber-50/80 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider font-body">AI Tayaari Assistant</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400 text-[#1E1B4B] shadow-xs">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm font-semibold text-amber-950 leading-snug font-body">
                      Ready to synthesize Halwai catering, Mandap decor & vendor checklists.
                    </p>
                    <span className="mt-2 inline-block text-xs font-black text-[#9E1B32] font-body">
                      {filteredEvents.length > 0 ? 'Select an event below' : 'Create an event to start'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Celebrations Section Heading */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-[#1E1B4B] font-headline">
                  {activeFilter === 'all'
                    ? 'All Celebrations'
                    : activeFilter === 'wedding'
                    ? '💍 Shaadi & Vivah'
                    : activeFilter === 'birthday'
                    ? '🎂 Janamdin / Birthdays'
                    : activeFilter === 'community'
                    ? '🍲 Bhandara & Melas'
                    : '🎉 Festive Socials'}
                </h3>
              </div>

              {/* Events Grid / Empty States */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-3xl bg-stone-200" />
                  ))}
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-800"
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
                <div className="rounded-3xl border-2 border-dashed border-amber-900/20 p-12 text-center bg-white shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <CalendarDays className="h-7 w-7 text-amber-800" />
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-[#1E1B4B]">
                    {currentUser
                      ? activeFilter === 'all'
                        ? `Namaste, ${currentUser.name}! No celebrations created yet`
                        : `No ${activeFilter} celebrations found for your account`
                      : activeFilter === 'all'
                      ? 'No celebrations created yet'
                      : `No ${activeFilter} celebrations found`}
                  </h4>
                  <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
                    {currentUser
                      ? 'Your CelebrateKaro workspace is ready. Plan your celebration to get customized AI checklists, auspicious countdowns, and precision Halwai & decor budget envelopes.'
                      : 'Create your celebration to get customized AI checklists, auspicious countdowns, and precision budget tracking.'}
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="saffron"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="rounded-full px-6 font-bold text-[#1E1B4B] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 cursor-pointer shadow-md"
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
          </div>
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  FOOTER (Clean CelebrateKaro Inspo Footer)                    */}
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
        userId={currentUser?.id}
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
