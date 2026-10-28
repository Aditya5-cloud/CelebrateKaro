'use client';

import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { loginUser, registerUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
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
    subtitle: 'Conferences & large productions',
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

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#2A0E1C]/65 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      {/* Modal Dialog Card (Straight square corners) */}
      <div className="relative w-full max-w-lg rounded-none border-2 border-[#F7418F] bg-[#FFF3C7] shadow-2xl p-4 sm:p-8 animate-in zoom-in-95 duration-200 z-10 my-auto sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-[#FEC7B4] relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#F7418F] text-white shadow-xs shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#FEC7B4] text-[#F7418F] border border-[#FC819E]">
                  CelebrateKaro Studio
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#2A0E1C]/70">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#F7418F]" /> Secure
                </span>
              </div>
              <h2
                id="auth-modal-title"
                className="text-lg sm:text-xl font-bold tracking-tight text-[#2A0E1C] mt-1 font-headline"
              >
                {tab === 'signin' ? 'Welcome Back' : 'Create Your Planner Account'}
              </h2>
              <p className="text-xs text-[#2A0E1C]/75 mt-0.5">
                {tab === 'signin'
                  ? 'Sign in with your registered credentials to access your celebrations'
                  : 'Join to coordinate budgets, vendors & checklists with AI'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-1.5 text-[#2A0E1C]/60 hover:text-[#F7418F] hover:bg-[#FEC7B4]/50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher (Segmented Control - Straight square corners) */}
        <div className="mt-5 p-1 rounded-none bg-[#FEC7B4]/40 border border-[#FEC7B4] grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`py-2 px-4 rounded-none text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'signin'
                ? 'bg-[#F7418F] text-white shadow-xs'
                : 'text-[#2A0E1C]/75 hover:text-[#F7418F]'
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
            className={`py-2 px-4 rounded-none text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-[#F7418F] text-white shadow-xs'
                : 'text-[#2A0E1C]/75 hover:text-[#F7418F]'
            }`}
          >
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-none bg-white border border-rose-400 p-3.5 text-xs text-rose-800 animate-in fade-in"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">{error}</div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: Sign In                                                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A0E1C]">
                <Mail className="h-3.5 w-3.5 text-[#F7418F]" /> Email Address
              </label>
              <Input
                type="email"
                required
                autoFocus
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 rounded-none bg-white border-[#FEC7B4] text-[#2A0E1C] focus-visible:ring-[#F7418F]"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A0E1C]">
                  <Lock className="h-3.5 w-3.5 text-[#F7418F]" /> Password
                </label>
                <span className="text-[11px] text-[#2A0E1C]/60">Registered password</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-10 pr-10 rounded-none bg-white border-[#FEC7B4] text-[#2A0E1C] focus-visible:ring-[#F7418F]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2A0E1C]/60 hover:text-[#F7418F] cursor-pointer p-0.5"
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
              className="w-full h-11 rounded-none bg-[#F7418F] hover:bg-[#e02b78] text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
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

            {/* Switch to Register */}
            <p className="text-center text-xs text-[#2A0E1C]/75 pt-2 border-t border-[#FEC7B4]">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className="font-bold text-[#F7418F] hover:underline cursor-pointer"
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
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A0E1C]">
                <UserIcon className="h-3.5 w-3.5 text-[#F7418F]" /> Full Name
              </label>
              <Input
                type="text"
                required
                autoFocus
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="h-10 rounded-none bg-white border-[#FEC7B4] text-[#2A0E1C] focus-visible:ring-[#F7418F]"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A0E1C]">
                <Mail className="h-3.5 w-3.5 text-[#F7418F]" /> Email Address
              </label>
              <Input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 rounded-none bg-white border-[#FEC7B4] text-[#2A0E1C] focus-visible:ring-[#F7418F]"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A0E1C]">
                  <Lock className="h-3.5 w-3.5 text-[#F7418F]" /> Password
                </label>
                <span className="text-[11px] text-[#2A0E1C]/60">Min. 6 characters</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a secure password"
                  className="h-10 pr-10 rounded-none bg-white border-[#FEC7B4] text-[#2A0E1C] focus-visible:ring-[#F7418F]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2A0E1C]/60 hover:text-[#F7418F] cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A0E1C]">
                  <Lock className="h-3.5 w-3.5 text-[#F7418F]" /> Confirm Password
                </label>
                {confirmPassword && (
                  <span
                    className={`text-[11px] flex items-center gap-1 font-bold ${
                      password === confirmPassword ? 'text-emerald-700' : 'text-rose-600'
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
                  className="h-10 pr-10 rounded-none bg-white border-[#FEC7B4] text-[#2A0E1C] focus-visible:ring-[#F7418F]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2A0E1C]/60 hover:text-[#F7418F] cursor-pointer p-0.5"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role / Planning Focus Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[#2A0E1C]">
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
                      className={`p-2.5 rounded-none border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-2 border-[#F7418F] bg-white shadow-xs'
                          : 'border border-[#FEC7B4] bg-[#FFF3C7]/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? 'text-[#F7418F]' : 'text-[#2A0E1C]/50'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-[#F7418F]' : 'text-[#2A0E1C]'
                          }`}
                        >
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#2A0E1C]/65 mt-1 leading-snug">
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
              className="w-full h-11 rounded-none bg-[#F7418F] hover:bg-[#e02b78] text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
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
            <p className="text-center text-xs text-[#2A0E1C]/75 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className="font-bold text-[#F7418F] hover:underline cursor-pointer"
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
