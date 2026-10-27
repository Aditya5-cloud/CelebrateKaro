'use client';

import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { loginUser, registerUser, DEMO_ACCOUNTS } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  X,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  HeartHandshake,
  CalendarDays,
  Wine,
  Trophy,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: (user: User, action: 'login' | 'register') => void;
}

const ROLES: { id: UserRole; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'host',
    title: 'Event Host',
    subtitle: 'Weddings & private parties',
    icon: HeartHandshake,
  },
  {
    id: 'planner',
    title: 'Celebration Planner',
    subtitle: 'Birthdays & anniversaries',
    icon: CalendarDays,
  },
  {
    id: 'community',
    title: 'Community Lead',
    subtitle: 'Galas & cultural festivals',
    icon: Wine,
  },
  {
    id: 'coordinator',
    title: 'Event Producer',
    subtitle: 'Conferences & large galas',
    icon: Trophy,
  },
];

export function AuthModal({
  isOpen,
  initialTab = 'signin',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('host');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowDemoSelector(false);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!result.success || !result.user) {
        setError(result.error || 'Failed to sign in. Please verify your email and password.');
        return;
      }
      onSuccess(result.user, 'login');
      onClose();
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser(name, email, password, role);
      if (!result.success || !result.user) {
        setError(result.error || 'Failed to create account.');
        return;
      }
      onSuccess(result.user, 'register');
      onClose();
    } catch {
      setError('An unexpected error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);
    try {
      const result = await loginUser(demoEmail, demoPass);
      if (result.success && result.user) {
        onSuccess(result.user, 'login');
        onClose();
      } else {
        setError(result.error || 'Could not log in with demo account.');
      }
    } catch {
      setError('Failed to log in with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop with frosted dark blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 z-10 my-8">
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-36 w-80 rounded-full bg-gradient-to-b from-[#00e599]/20 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 relative">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="CelebrateKaro Logo"
              className="h-11 w-11 rounded-2xl object-contain shadow-md shrink-0 border border-amber-400/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-700 font-body">
                  CelebrateKaro Studio
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 font-body">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure
                </span>
              </div>
              <h2
                id="auth-modal-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 font-headline"
              >
                {tab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-body">
                {tab === 'signin'
                  ? 'Sign in with your registered credentials to access celebrations'
                  : 'Join CelebrateKaro to manage budgets, vendors & AI checklists'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher (Segmented Control) */}
        <div className="mt-5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'signin'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in slide-in-from-top-1"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: Sign In                                                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-[#073330] dark:focus-visible:ring-emerald-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" /> Password
                </label>
                <span className="text-[11px] text-zinc-400">Exact registered password</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-10 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-[#073330] dark:focus-visible:ring-emerald-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-2xl bg-[#073330] hover:bg-[#0c4b47] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-[#073330] font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Quick Demo Accounts Helper */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Quick Demo Accounts:</span>
                <button
                  type="button"
                  onClick={() => setShowDemoSelector(!showDemoSelector)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  {showDemoSelector ? 'Hide 1-click accounts' : '⚡ 1-Click Demo Login'}
                </button>
              </div>

              {showDemoSelector && (
                <div className="mt-2 grid grid-cols-1 gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 animate-in fade-in duration-150">
                  {DEMO_ACCOUNTS.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectDemo(demo.email, demo.password)}
                      className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {demo.name}{' '}
                          <span className="text-[10px] font-normal text-zinc-400">({demo.roleLabel})</span>
                        </p>
                        <p className="text-[11px] text-zinc-400">{demo.email}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Log in →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Switch to Register */}
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className="font-bold text-[#073330] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </p>
          </form>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: Register                                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <UserIcon className="h-3.5 w-3.5 text-zinc-400" /> Full Name
              </label>
              <Input
                type="text"
                required
                autoFocus
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-[#073330] dark:focus-visible:ring-emerald-400"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address
              </label>
              <Input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-[#073330] dark:focus-visible:ring-emerald-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" /> Password
                </label>
                <span className="text-[11px] text-zinc-400">Min. 6 characters</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a secure password"
                  className="h-10 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-[#073330] dark:focus-visible:ring-emerald-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" /> Confirm Password
                </label>
                {confirmPassword && (
                  <span
                    className={`text-[11px] flex items-center gap-1 ${
                      password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </>
                    ) : (
                      'Passwords must match'
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="h-10 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-[#073330] dark:focus-visible:ring-emerald-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role / Planning Focus Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Planning Focus
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setRole(r.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#073330] bg-[#073330]/5 dark:border-emerald-500 dark:bg-emerald-950/30 ring-1 ring-[#073330] dark:ring-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            isSelected ? 'text-[#073330] dark:text-emerald-400' : 'text-zinc-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-[#073330] dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-snug">
                        {r.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Register Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-2xl bg-[#073330] hover:bg-[#0c4b47] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-[#073330] font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Secure Account...</span>
                </>
              ) : (
                <>
                  <span>Register & Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Switch to Sign In */}
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className="font-bold text-[#073330] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
