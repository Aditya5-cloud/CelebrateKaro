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
import { formatCurrency } from '@/lib/formatters';
import {
  getCurrentUser,
  logoutUser,
  subscribeToAuthChanges,
} from '@/lib/auth';

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

  /**
   * When a user logs in or registers:
   * 1. Save user state
   * 2. Direct them IMMEDIATELY to their dashboard!
   */
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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-violet-600 focus:shadow-lg dark:focus:bg-zinc-900"
      >
        Skip to main content
      </a>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  HEADER NAVBAR with Real-Time Corner Controls & Production Auth */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Brand Logo & View Toggle */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  Celebration Planner
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">
                    Gemini 3.5
                  </span>
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block leading-tight">
                  Real-Time Event Management System
                </span>
              </div>
            </Link>

            {/* Navigation Switcher Pills */}
            <nav aria-label="Page View Navigation" className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-100/90 p-1 dark:bg-zinc-900/90 border border-zinc-200/50 dark:border-zinc-800/50">
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'landing'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span>🌟 Overview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    handleOpenAuth('signin');
                  } else {
                    setViewMode('dashboard');
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span>📊 Planner Dashboard</span>
                {events.length > 0 && (
                  <span className="rounded-full bg-violet-100 px-1.5 py-0.2 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    {events.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* TOP RIGHT CORNER: Real-Time Sync Indicator & Production Auth Controls */}
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
                <button
                  type="button"
                  onClick={() => handleOpenAuth('signin')}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/80 transition-all"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
                >
                  <span>Register Free</span>
                </button>
              </div>
            ) : (
              /* When USER IS LOGGED IN: Profile Chip, Dashboard Shortcut, Log Out */
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
                  <button
                    type="button"
                    onClick={() => setViewMode('dashboard')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-all active:scale-[0.98]"
                  >
                    <span>Dashboard</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-all active:scale-[0.98]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>New Celebration</span>
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
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
              className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 shadow-xs animate-in slide-in-from-top-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  ✓
                </span>
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  VIEW 1: CLEAN, ENGAGING MARKETING LANDING PAGE (DEFAULT)   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'landing' ? (
          <div>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10" />
                <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-600/10" />
              </div>

              <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-3.5 py-1 text-xs font-semibold text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-300 shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                  <span>Google Gemini 3.5 Flash-Lite & SQLite Powered</span>
                </div>

                <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                  The intelligent operating system for{' '}
                  <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    unforgettable celebrations.
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Plan weddings, milestone birthdays, and community festivals with AI-generated checklists,
                  integer-cent financial tracking, automated milestone roadmaps, and vendor RFQ drafting.
                </p>

                {/* Hero Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {!currentUser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenAuth('register')}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 transition-all active:scale-[0.98]"
                      >
                        <span>Get Started Free</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAuth('signin')}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/90 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
                      >
                        <span>Sign In to Dashboard</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setViewMode('dashboard')}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 transition-all active:scale-[0.98]"
                    >
                      <span>Open My Dashboard ({events.length} Events)</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Core Architectural Metrics */}
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
                  <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="text-xl sm:text-2xl font-black text-violet-600 dark:text-violet-400">
                      Gemini 3.5
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Flash-Lite AI Engine</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      0ms Latency
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Local SQLite WAL Mode</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                      100% Cents
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Integer Precision Math</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                      Multi-User
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Real-Time Synced</p>
                  </div>
                </div>
              </div>
            </section>

            {/* PRODUCT CAPABILITY MODULE SHOWCASE */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Comprehensive Platform Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                  Engineered for seamless celebration execution
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mt-2">
                  Explore each modular superpower built into Celebration Planner.
                </p>
              </div>

              <InteractiveShowcase />
            </section>

            {/* 6 CORE PILLARS FEATURE GRID */}
            <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Feature Breakdown
                </span>
                <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                  Built for hosts, planners, and community directors
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: '✨',
                    title: 'Gemini 3.5 AI Checklists',
                    desc: 'Synthesize 8–14 actionable roadmap tasks customized to your guest count, budget, and celebration theme with zero-loss domain fallbacks.',
                    tag: 'AI Synthesis',
                  },
                  {
                    icon: '💰',
                    title: 'Integer-Cent Financials',
                    desc: 'Category-level budget variance analysis with pure integer cent math, eliminating IEEE-754 floating point rounding discrepancies.',
                    tag: 'Precision Math',
                  },
                  {
                    icon: '⏱️',
                    title: 'Chronological Milestones',
                    desc: 'Real-time countdowns ("In 45 days", "Tomorrow", "Today!") with automated overdue flags for missed planning deadlines.',
                    tag: 'Timeline',
                  },
                  {
                    icon: '📋',
                    title: 'Vendor Booking Pipeline',
                    desc: 'Manage caterers, photographers, florists, and venues across 5 stages: Considering → Contacted → Booked → Paid → Cancelled.',
                    tag: 'Vendor CRM',
                  },
                  {
                    icon: '🤖',
                    title: 'Grounded Assistant Chat',
                    desc: 'Multi-turn conversational AI grounded in your live database numbers. Ask questions about budget optimization and vendor gaps.',
                    tag: 'Grounded Memory',
                  },
                  {
                    icon: '✉️',
                    title: 'Automated RFQ Drafter',
                    desc: 'Draft polished vendor inquiries, detailed RFQ spec sheets, tasting requests, and courteous budget negotiations with one click.',
                    tag: 'Email Generator',
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="relative rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-violet-300 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-violet-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Effortless Workflow
                </span>
                <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                  How celebration planning works
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white font-bold text-sm">
                    1
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-white">
                    Create Your Celebration
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Input your event type (Wedding, Birthday, Community, or other), target date, guest count, and initial budget.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                    2
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-white">
                    AI Roadmap Synthesis
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Gemini 3.5 Flash-Lite generates a tailored checklist, category budget distribution, and timeline milestones.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-sm">
                    3
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-white">
                    Collaborate & Execute
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Track vendor quotes, draft outreach emails, converse with the grounded assistant, and mark tasks complete.
                  </p>
                </div>
              </div>
            </section>

            {/* CALL TO ACTION BANNER */}
            <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-zinc-900 p-8 sm:p-12 text-center text-white shadow-2xl">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Ready to launch your celebration?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-violet-200">
                  Zero setup, 100% offline-capable, and completely free to start.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {!currentUser ? (
                    <button
                      type="button"
                      onClick={() => handleOpenAuth('register')}
                      className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 shadow-md hover:bg-zinc-100 transition-all active:scale-[0.98]"
                    >
                      <span>Create Free Account & Go to Dashboard</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setViewMode('dashboard')}
                      className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 shadow-md hover:bg-zinc-100 transition-all active:scale-[0.98]"
                    >
                      <span>Open My Dashboard</span>
                    </button>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/70 pb-4 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                    Celebrations Workspace
                  </h2>
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {currentUser ? (
                    <span>
                      Active User: <strong className="text-zinc-800 dark:text-zinc-200">{currentUser.name}</strong> ({currentUser.roleLabel}) • Real-time database synced
                    </span>
                  ) : (
                    <span>Real-time local SQLite workspace with Gemini 3.5 AI generation</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchEvents()}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <svg className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Sync Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-all active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Plan Celebration</span>
                </button>
              </div>
            </div>

            {/* Dashboard Overview Cards */}
            <section aria-labelledby="stats-heading" className="mb-8">
              <h3 id="stats-heading" className="sr-only">
                Event Planning Statistics
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Celebrations</span>
                  <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {stats.totalEvents}
                  </p>
                  <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {stats.upcomingCount} upcoming
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Budget Managed</span>
                  <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(stats.totalBudget)}
                  </p>
                  <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Tracked in real-time</span>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Expected Guests</span>
                  <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {stats.totalGuests.toLocaleString()}
                  </p>
                  <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Across all events</span>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5 shadow-xs dark:border-violet-900/50 dark:bg-violet-950/30">
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">GenAI Assistant</span>
                  <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Ready to synthesize custom vendor checklists, timelines, and ideas.
                  </p>
                  <span className="mt-1 inline-block text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {filteredEvents.length > 0 ? 'Select an event below' : 'Create an event to start'}
                  </span>
                </div>
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
                          ? 'bg-violet-600 text-white shadow-xs'
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
                  onClick={() => fetchEvents()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl dark:bg-violet-950/60 text-violet-600">
                  🎉
                </div>
                <h4 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activeFilter === 'all'
                    ? 'No celebrations created yet'
                    : `No ${activeFilter} celebrations found`}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                  Create your celebration to get personalized Gemini AI checklists, timeline milestones, and precision budget trackers.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
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
          </div>
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  FOOTER                                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200/80 bg-white py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>PromptWar Challenge 5: Celebration & Event Planner • GenAI-Powered Assistant</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Next.js 16 (Turbopack)</span>
            <span>•</span>
            <span>SQLite WAL Mode</span>
            <span>•</span>
            <span>Google Gemini 3.5 Flash-Lite</span>
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
