'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EventType, User } from '@/types';
import type { EventWithStats } from '@/lib/events';
import { EventCard } from '@/components/events/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/events/DeleteConfirmModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { InspoHero } from '@/components/landing/InspoHero';
import { CelebrationsCarousel } from '@/components/landing/CelebrationsCarousel';
import { InspoOutro } from '@/components/landing/InspoOutro';
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
  IndianRupee,
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
  IndianRupee as BudgetIcon,
  ListChecks,
  Store,
  Bot,
} from 'lucide-react';

export default function HomePage() {
  // Navigation View State: 'landing' (default for guests) or 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      return getCurrentUser();
    }
    return null;
  });
  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'register'>('signin');

  // Events & Dashboard State
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const isFetchingRef = useRef(false);

  // Mobile User Menu State (reveal signout when tapping username icon)
  const [showMobileSignOut, setShowMobileSignOut] = useState(false);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile signout toggle when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileSignOut(false);
      }
    }
    if (showMobileSignOut) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMobileSignOut]);

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

  // Fetch events from API with real-time tracking
  const fetchEvents = useCallback(async (userIdOverride?: string | null) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsSyncing(true);
    setError(null);
    try {
      const activeUser =
        userIdOverride !== undefined
          ? userIdOverride
          : (currentUserRef.current?.id ?? (typeof window !== 'undefined' ? getCurrentUser()?.id : null));

      if (!activeUser) {
        setEvents([]);
        setIsLoading(false);
        setIsSyncing(false);
        isFetchingRef.current = false;
        return;
      }

      const url = `/api/events?userId=${encodeURIComponent(activeUser)}`;
      const headers: Record<string, string> = {
        'x-user-id': activeUser,
      };

      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load celebrations.');
      }
      setEvents(json.data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`celebrations_cache_${activeUser}`, JSON.stringify(json.data));
        } catch {
          // Ignore local storage quota limits
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Could not connect to the database. Please refresh to try again.');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Subscribe to real-time auth changes across tabs and fetch events for active user
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.id !== currentUserRef.current?.id) {
      setCurrentUser(user);
    }
    if (user && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') !== 'landing') {
        setViewMode('dashboard');
      }
      try {
        const cached = localStorage.getItem(`celebrations_cache_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEvents(parsed);
            setIsLoading(false);
          }
        }
      } catch {
        // Fall back to network load
      }
    }
    fetchEvents(user ? user.id : null);

    const unsubscribe = subscribeToAuthChanges((newUser) => {
      if (newUser?.id !== currentUserRef.current?.id) {
        setCurrentUser(newUser);
      }
      if (newUser && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') !== 'landing') {
          setViewMode('dashboard');
        }
        try {
          const cached = localStorage.getItem(`celebrations_cache_${newUser.id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEvents(parsed);
              setIsLoading(false);
            }
          }
        } catch {
          // Fall back to network load
        }
      }
      fetchEvents(newUser ? newUser.id : null);
    });
    return () => unsubscribe();
  }, [fetchEvents]);

  // Aggregate stats across celebrations
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalBudget = events.reduce((acc, curr) => acc + curr.total_budget, 0);
    const totalGuests = events.reduce((acc, curr) => acc + curr.guest_count, 0);

    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = events.filter((e) => e.event_date >= today).length;
    const pastCount = events.filter((e) => e.event_date < today).length;

    return { totalEvents, totalBudget, totalGuests, upcomingCount, pastCount };
  }, [events]);

  // Filtered events based on selected celebration type and time timeline
  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter((e) => {
      const matchesType = activeFilter === 'all' || e.event_type === activeFilter;
      const matchesTime =
        timeFilter === 'all'
          ? true
          : timeFilter === 'upcoming'
          ? e.event_date >= today
          : e.event_date < today;
      return matchesType && matchesTime;
    });
  }, [events, activeFilter, timeFilter]);

  const handleEventCreated = () => {
    setIsCreateModalOpen(false);
    fetchEvents();
  };

  const handleDeleteConfirm = async (event: { id: number }) => {
    setIsDeleting(true);
    try {
      const activeUserId = currentUserRef.current?.id;
      const headers: Record<string, string> = {};
      if (activeUserId) {
        headers['x-user-id'] = activeUserId;
      }
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete celebration.');
      }
      setEventToDelete(null);
      fetchEvents(activeUserId);
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
    setShowMobileSignOut(false);
    fetchEvents(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF3C7] text-[#2A0E1C] flex flex-col font-sans selection:bg-[#F7418F] selection:text-white">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-[#2A0E1C] focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  HEADER NAVBAR: Light square architectural header             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b-2 border-[#FEC7B4] bg-[#FFF3C7] text-[#2A0E1C] transition-all shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2 sm:gap-2.5 group focus:outline-hidden"
            >
              <Image
                src="/icon.png"
                alt="CelebrateKaro Logo"
                width={32}
                height={32}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-none object-contain shadow-xs border border-[#F7418F] group-hover:scale-105 transition-transform shrink-0"
              />
              <div>
                <span className="text-sm sm:text-base font-bold tracking-tight text-[#2A0E1C] flex items-center gap-1.5 font-headline">
                  CelebrateKaro
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-[#F7418F] text-white font-body hidden sm:inline-block">
                    AI Studio
                  </span>
                </span>
                <span className="text-[11px] text-[#2A0E1C]/70 hidden sm:block leading-tight font-medium font-body">
                  Celebration &amp; Event Planner
                </span>
              </div>
            </Link>
          </div>

          {/* TOP RIGHT CORNER: Auth Controls (Straight square corners) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAuth('signin')}
                  className="rounded-none text-xs sm:text-sm px-2.5 sm:px-3 text-[#2A0E1C] hover:text-[#F7418F] hover:bg-[#FEC7B4]/40 cursor-pointer font-bold"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleOpenAuth('register')}
                  className="rounded-none px-3 sm:px-4 py-2 font-bold cursor-pointer text-white bg-[#F7418F] hover:bg-[#e02b78] border border-[#F7418F] shadow-[2px_2px_0px_0px_#2A0E1C] uppercase text-[11px] sm:text-xs tracking-wider"
                >
                  <span className="hidden sm:inline">Get Started →</span>
                  <span className="sm:hidden">Start →</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Desktop User Profile Chip (Unchanged on sm+ desktop) */}
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 rounded-none border border-[#FEC7B4] bg-white p-1 sm:pl-2 sm:pr-3 sm:py-1 text-[#2A0E1C]">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-none ${currentUser.avatarColor || 'bg-[#F7418F]'} text-white font-bold text-[11px]`}>
                    {currentUser.name[0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-[#2A0E1C] truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[#F7418F] leading-tight font-semibold">
                      {currentUser.roleLabel}
                    </p>
                  </div>
                </div>

                {/* Dashboard Action Button */}
                {viewMode === 'landing' ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setViewMode('dashboard')}
                    className="cursor-pointer rounded-none text-xs sm:text-sm px-2.5 sm:px-3 text-white font-bold bg-[#F7418F] hover:bg-[#e02b78]"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('landing')}
                      className="hidden sm:inline-flex text-[#2A0E1C] hover:text-[#F7418F] hover:bg-[#FEC7B4]/40 cursor-pointer rounded-none font-bold text-xs"
                    >
                      <span>Home</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="hidden sm:inline-flex cursor-pointer rounded-none text-xs sm:text-sm px-2.5 sm:px-3 text-white font-bold bg-[#F7418F] hover:bg-[#e02b78] items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>New Celebration</span>
                    </Button>
                  </div>
                )}

                {/* Desktop Sign Out Button (Unchanged on sm+ desktop) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="hidden sm:inline-flex rounded-none text-[#2A0E1C]/70 hover:text-[#F7418F] hover:bg-[#FEC7B4]/40 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </Button>

                {/* Mobile Responsive: Username Icon at the place of Sign Out icon, revealing Sign Out when tapped */}
                <div className="relative sm:hidden" ref={mobileUserMenuRef}>
                  {!showMobileSignOut ? (
                    <button
                      type="button"
                      onClick={() => setShowMobileSignOut(true)}
                      title={`Signed in as ${currentUser.name}. Tap to sign out.`}
                      aria-label="User menu"
                      className={`flex h-8 w-8 items-center justify-center rounded-none ${currentUser.avatarColor || 'bg-[#F7418F]'} text-white font-bold text-xs border border-[#F7418F] shadow-xs cursor-pointer active:scale-95 transition-transform`}
                    >
                      {currentUser.name[0]}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Sign Out"
                      aria-label="Sign Out"
                      className="flex h-8 px-2.5 items-center justify-center gap-1.5 rounded-none bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
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
        {/*  VIEW 1: CLEAN CONCISE SINGLE-GLANCE LANDING SHOWCASE       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'landing' ? (
          <div className="bg-[#FFF3C7]">
            {/* 1. HERO SECTION: Fits Above-The-Fold at First Glance */}
            <InspoHero
              onStartPlanning={() => handleOpenAuth('register')}
              isLoggedIn={!!currentUser}
              onOpenDashboard={() => setViewMode('dashboard')}
              eventsCount={events.length}
            />

            {/* 2. 4-PILLAR FEATURE SHOWCASE (Straight square cards, spacious layout) */}
            <section className="py-16 sm:py-20 lg:py-24 border-b-2 border-[#FEC7B4] bg-[#FFF3C7]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider px-3.5 py-1 rounded-none bg-[#FEC7B4] text-[#F7418F] border border-[#FC819E]">
                    Core Capabilities
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A0E1C] mt-3 tracking-tight">
                    Everything You Need in One Unified Studio
                  </h2>
                  <p className="mt-3 text-base sm:text-xl text-[#2A0E1C]/80 max-w-2xl mx-auto leading-relaxed">
                    Purpose-built features designed specifically for weddings, birthdays, galas, and festive milestones.
                  </p>
                </div>

                {/* 4 Straight Square Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Pillar 1: Budget */}
                  <div className="rounded-none border-2 border-[#FEC7B4] bg-white p-6 sm:p-7 shadow-xs hover:border-[#F7418F] hover:shadow-[4px_4px_0px_0px_#FC819E] transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#FEC7B4]/50 border border-[#FC819E] text-[#F7418F] mb-4">
                      <BudgetIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-[#2A0E1C]">Precision Budgeting</h3>
                    <p className="mt-2 text-sm text-[#2A0E1C]/75 leading-relaxed">
                      Plan category budgets, record real-time vendor payments, and eliminate surprise overspending.
                    </p>
                  </div>

                  {/* Pillar 2: Checklists */}
                  <div className="rounded-none border-2 border-[#FEC7B4] bg-white p-6 sm:p-7 shadow-xs hover:border-[#F7418F] hover:shadow-[4px_4px_0px_0px_#FC819E] transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#FEC7B4]/50 border border-[#FC819E] text-[#F7418F] mb-4">
                      <ListChecks className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-[#2A0E1C]">Automated Checklists</h3>
                    <p className="mt-2 text-sm text-[#2A0E1C]/75 leading-relaxed">
                      Instant tailored to-dos by celebration date, ensuring you never miss a critical preparation milestone.
                    </p>
                  </div>

                  {/* Pillar 3: Vendors */}
                  <div className="rounded-none border-2 border-[#FEC7B4] bg-white p-6 sm:p-7 shadow-xs hover:border-[#F7418F] hover:shadow-[4px_4px_0px_0px_#FC819E] transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#FEC7B4]/50 border border-[#FC819E] text-[#F7418F] mb-4">
                      <Store className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-[#2A0E1C]">Vendor Hub &amp; RFQs</h3>
                    <p className="mt-2 text-sm text-[#2A0E1C]/75 leading-relaxed">
                      Track caterers, decorators, and photographers with auto-drafted outreach inquiry emails.
                    </p>
                  </div>

                  {/* Pillar 4: AI Concierge */}
                  <div className="rounded-none border-2 border-[#FEC7B4] bg-white p-6 sm:p-7 shadow-xs hover:border-[#F7418F] hover:shadow-[4px_4px_0px_0px_#FC819E] transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#FEC7B4]/50 border border-[#FC819E] text-[#F7418F] mb-4">
                      <Bot className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-[#2A0E1C]">AI Planning Assistant</h3>
                    <p className="mt-2 text-sm text-[#2A0E1C]/75 leading-relaxed">
                      Get contextual advice on guest management, decor themes, and day-of schedules on demand.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. POPULAR CELEBRATIONS CAROUSEL */}
            <CelebrationsCarousel />

            {/* 4. COMPLETE LANDING OUTRO & FINAL CALL TO ACTION */}
            <InspoOutro
              onStartPlanning={() => handleOpenAuth('register')}
              isLoggedIn={!!currentUser}
              onOpenDashboard={() => setViewMode('dashboard')}
            />
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════ */
          /*  VIEW 2: FULL WORKING PLANNER DASHBOARD WITH SIDEBAR         */
          /* ═══════════════════════════════════════════════════════════ */
          <div className="min-h-[calc(100vh-60px)] bg-[#FFF3C7] text-[#2A0E1C] flex flex-col md:flex-row">
            {/* ─── MOBILE CONTROLS & FILTER BAR (< md screens) ─── */}
            <div className="md:hidden bg-white border-b border-[#FEC7B4] px-4 py-2.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-[#2A0E1C] font-headline tracking-tight leading-none">
                    Celebrations
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-none bg-[#FEC7B4] text-[#F7418F] border border-[#FC819E]">
                    {events.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchEvents()}
                    disabled={isSyncing}
                    title="Sync Celebrations"
                    aria-label="Sync Celebrations"
                    className="h-7 w-7 rounded-none text-[#2A0E1C]/70 hover:text-[#F7418F] hover:bg-[#FEC7B4]/40"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#F7418F]' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-none font-bold text-xs text-white bg-[#F7418F] hover:bg-[#e02b78] shadow-xs flex items-center gap-1.5 shrink-0 px-3 py-1.5 border border-[#F7418F] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Plan Event</span>
                  </Button>
                </div>
              </div>

              {/* Horizontal scrollable category filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1.5 -mx-4 px-4 border-t border-[#FEC7B4]/50 scrollbar-none">
                {[
                  { id: 'all', label: 'All', count: events.length },
                  { id: 'wedding', label: '💍 Weddings', count: events.filter(e => e.event_type === 'wedding').length },
                  { id: 'birthday', label: '🎂 Birthdays', count: events.filter(e => e.event_type === 'birthday').length },
                  { id: 'community', label: '🥂 Galas', count: events.filter(e => e.event_type === 'community').length },
                  { id: 'other', label: '🎉 Other', count: events.filter(e => e.event_type === 'other').length },
                ].map((tab) => {
                  const active = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id as EventType | 'all')}
                      className={`px-3 py-1.5 rounded-none text-xs font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#F7418F] text-white shadow-xs'
                          : 'bg-[#FFF3C7]/60 text-[#2A0E1C] border border-[#FEC7B4] hover:bg-[#FEC7B4]'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── DESKTOP LEFT SIDEBAR (Unchanged on md and lg, straight square corners) ─── */}
            <aside aria-label="Dashboard Sidebar" className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-[#FEC7B4] p-5 sm:p-6 flex-col justify-between shrink-0 shadow-xs">
              <div className="space-y-6">
                {/* User / Workspace Profile Card */}
                <div className="p-4 rounded-none bg-[#2A0E1C] text-white shadow-xs space-y-3 border-2 border-[#F7418F]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-none ${currentUser?.avatarColor || 'bg-[#F7418F]'} text-white font-black text-sm shadow-xs`}>
                      {currentUser ? currentUser.name[0] : 'C'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate leading-tight text-white">
                        {currentUser ? currentUser.name : 'Celebration Host'}
                      </p>
                      <p className="text-xs text-[#FEC7B4] font-semibold leading-tight mt-0.5">
                        {currentUser ? currentUser.roleLabel : 'Planner'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#FEC7B4] font-medium">
                    <span>Database</span>
                    <span className="text-[#FC819E] font-bold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-none bg-[#F7418F] animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <Button
                  variant="default"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full h-11 rounded-none font-bold text-xs uppercase tracking-wider text-white bg-[#F7418F] hover:bg-[#e02b78] shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#F7418F]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Plan Celebration</span>
                </Button>

                {/* Navigation / Filter Categories in Sidebar */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A0E1C]/60 px-3 block mb-2">
                    Event Categories
                  </span>
                  {[
                    { id: 'all', label: 'All Celebrations', icon: Sparkles, iconColor: 'text-[#F7418F]' },
                    { id: 'wedding', label: 'Weddings', icon: Heart, iconColor: 'text-[#F7418F]' },
                    { id: 'birthday', label: 'Birthdays', icon: Cake, iconColor: 'text-[#FC819E]' },
                    { id: 'community', label: 'Galas & Banquets', icon: Wine, iconColor: 'text-[#F7418F]' },
                    { id: 'other', label: 'Other Parties', icon: PartyPopper, iconColor: 'text-[#FC819E]' },
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
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#F7418F] text-white shadow-xs'
                            : 'text-[#2A0E1C] hover:bg-[#FEC7B4]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : tab.iconColor}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold shrink-0 ${
                          active ? 'bg-white text-[#F7418F]' : 'bg-[#FFF3C7] text-[#2A0E1C] border border-[#FEC7B4]'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Bottom: Sign Out */}
              {currentUser && (
                <div className="pt-4 mt-6 border-t border-[#FEC7B4] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer px-2 py-1 hover:bg-rose-50/50 rounded-none transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </aside>

            {/* ─── MAIN CONTENT AREA ─── */}
            <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 overflow-y-auto max-w-7xl">
              {/* Header inside main area (Unchanged on md+ desktop, hidden on mobile to eliminate duplicate title and sync/plan buttons) */}
              <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FEC7B4] pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2A0E1C] font-headline">
                      Celebration Workspace
                    </h2>
                    <Badge variant="secondary" className="font-bold bg-[#FEC7B4] text-[#F7418F] border border-[#FC819E] rounded-none">
                      {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2A0E1C]/75 mt-1 font-medium font-body">
                    {currentUser ? (
                      <span>
                        Active Host: <strong className="text-[#F7418F]">{currentUser.name}</strong> ({currentUser.roleLabel}) • Database synced
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
                    className="border-[#FEC7B4] text-[#2A0E1C] hover:bg-[#FEC7B4]/50 rounded-none font-bold cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </Button>
                </div>
              </div>

              {/* Dashboard Overview Cards (Straight square corners) */}
              <section aria-labelledby="stats-heading">
                <h3 id="stats-heading" className="sr-only">
                  Event Planning Statistics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-5 rounded-none border border-[#FEC7B4] bg-white shadow-xs hover:border-[#F7418F] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/60 uppercase tracking-wider">Total Celebrations</span>
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none bg-[#FFF3C7] text-[#F7418F] border border-[#FEC7B4]">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#2A0E1C] tabular-nums font-headline">
                      {stats.totalEvents}
                    </p>
                    <span className="mt-1 text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium block">
                      {stats.upcomingCount} upcoming{stats.pastCount > 0 ? ` • ${stats.pastCount} celebrated` : ''}
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-5 rounded-none border border-[#FEC7B4] bg-white shadow-xs hover:border-[#F7418F] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/60 uppercase tracking-wider">Total Budget</span>
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none bg-[#FFF3C7] text-[#F7418F] border border-[#FEC7B4]">
                        <IndianRupee className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#2A0E1C] tabular-nums font-headline truncate" title={formatCurrency(stats.totalBudget)}>
                      {formatCurrency(stats.totalBudget)}
                    </p>
                    <span className="mt-1 text-[11px] sm:text-xs text-[#F7418F] font-bold block truncate">
                      Across active events
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-5 rounded-none border border-[#FEC7B4] bg-white shadow-xs hover:border-[#F7418F] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/60 uppercase tracking-wider">Expected Guests</span>
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none bg-[#FFF3C7] text-[#FC819E] border border-[#FEC7B4]">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#2A0E1C] tabular-nums font-headline">
                      {stats.totalGuests.toLocaleString()}
                    </p>
                    <span className="mt-1 text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium block">Across all events</span>
                  </div>

                  <div className="p-3.5 sm:p-5 rounded-none border-2 border-[#F7418F] bg-[#FEC7B4]/30 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-[#F7418F] uppercase tracking-wider">AI Studio</span>
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none bg-[#F7418F] text-white shadow-xs">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#2A0E1C] leading-snug line-clamp-2">
                      Synthesize catering envelopes, decor &amp; checklists.
                    </p>
                    <span className="mt-1.5 inline-block text-[11px] sm:text-xs font-bold text-[#F7418F]">
                      {filteredEvents.length > 0 ? 'Select event below' : 'Create event to start'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Celebrations Section Heading & Real-time Timeline Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FEC7B4]/50 pb-2">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2A0E1C] font-headline">
                  {activeFilter === 'all'
                    ? 'All Celebrations'
                    : activeFilter === 'wedding'
                    ? '💍 Weddings'
                    : activeFilter === 'birthday'
                    ? '🎂 Birthdays'
                    : activeFilter === 'community'
                    ? '🥂 Galas & Banquets'
                    : '🎉 Other Parties'}
                </h3>

                {/* Real-time Timeline Filter: Upcoming vs Celebrated */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'all', label: 'All', count: events.length },
                    { id: 'upcoming', label: '⏳ Upcoming', count: stats.upcomingCount },
                    { id: 'past', label: '🎉 Celebrated', count: stats.pastCount },
                  ].map((filterTab) => {
                    const active = timeFilter === filterTab.id;
                    return (
                      <button
                        key={filterTab.id}
                        type="button"
                        onClick={() => setTimeFilter(filterTab.id as typeof timeFilter)}
                        className={`px-3 py-1 text-xs font-bold rounded-none whitespace-nowrap transition-colors cursor-pointer border ${
                          active
                            ? 'bg-[#F7418F] text-white border-[#F7418F] shadow-xs'
                            : 'bg-white text-[#2A0E1C] border-[#FEC7B4] hover:bg-[#FEC7B4]/40'
                        }`}
                      >
                        {filterTab.label} ({filterTab.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Events Grid / Empty States */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-none bg-[#FEC7B4]/40" />
                  ))}
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="rounded-none border border-red-300 bg-white p-8 text-center text-red-800"
                >
                  <p className="font-semibold">{error}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => fetchEvents()}
                    className="mt-4 rounded-none"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="rounded-none border-2 border-dashed border-[#FEC7B4] p-12 text-center bg-white shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-[#FFF3C7] border border-[#FEC7B4] text-[#F7418F]">
                    <CalendarDays className="h-7 w-7 text-[#F7418F]" />
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-[#2A0E1C]">
                    {currentUser
                      ? activeFilter === 'all'
                        ? `Welcome, ${currentUser.name}! No celebrations created yet`
                        : `No ${activeFilter} celebrations found for your account`
                      : activeFilter === 'all'
                      ? 'No celebrations created yet'
                      : `No ${activeFilter} celebrations found`}
                  </h4>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#2A0E1C]/75">
                    Your workspace is ready. Plan your celebration to get customized AI checklists, countdowns, and precision budget tracking.
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="default"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="rounded-none px-6 font-bold text-white bg-[#F7418F] hover:bg-[#e02b78] cursor-pointer shadow-xs border border-[#F7418F]"
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
      {/*  FOOTER                                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ─── MOBILE-ONLY FLOATING AI CONCIERGE BUBBLE (Bottom-Right Corner) ─── */}
      {currentUser && (
        <div className="fixed bottom-6 right-5 z-40 md:hidden pointer-events-auto">
          {events.length > 0 ? (
            <Link
              href={`/events/${events[0].id}?tab=assistant`}
              aria-label="Open AI Planning Concierge"
              className="h-14 w-14 rounded-full bg-[#F7418F] hover:bg-[#e02b78] active:scale-95 text-white shadow-[0_4px_20px_rgba(247,65,143,0.5)] border-2 border-white flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFF3C7] border-2 border-[#F7418F]" />
              </div>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Open AI Celebration Planning"
              className="h-14 w-14 rounded-full bg-[#F7418F] hover:bg-[#e02b78] active:scale-95 text-white shadow-[0_4px_20px_rgba(247,65,143,0.5)] border-2 border-white flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFF3C7] border-2 border-[#F7418F]" />
              </div>
            </button>
          )}
        </div>
      )}

      <InspoFooter />

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  MODALS (Straight square corners)                             */}
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
