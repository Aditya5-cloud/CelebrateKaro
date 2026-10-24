'use client';

import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { loginUser, registerUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, X, AlertCircle, ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: (user: User, action: 'login' | 'register') => void;
}

export function AuthModal({
  isOpen,
  initialTab = 'signin',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('host');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setPassword('');
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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginUser(email);
    if (!result.success || !result.user) {
      setError(result.error || 'Failed to sign in. Please verify your email.');
      return;
    }
    onSuccess(result.user, 'login');
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = registerUser(name, email, role);
    if (!result.success || !result.user) {
      setError(result.error || 'Failed to register account.');
      return;
    }
    onSuccess(result.user, 'register');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop with frosted blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {tab === 'signin' ? 'Sign in to Your Account' : 'Create Your Planner Account'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {tab === 'signin' ? 'Access your real-time celebrations workspace' : 'Plan celebrations with Gemini 3.5 AI'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger
              className="flex-1"
              active={tab === 'signin'}
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              className="flex-1"
              active={tab === 'register'}
              onClick={() => {
                setTab('register');
                setError(null);
              }}
            >
              Create Account
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            className="mt-3.5 flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="mt-4 space-y-3.5">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address
              </label>
              <Input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-zinc-400" /> Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full mt-2">
              <span>Sign In to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Create one now
              </button>
            </p>
          </form>
        )}

        {/* TAB 2: Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-3.5">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <UserIcon className="h-3.5 w-3.5 text-zinc-400" /> Your Full Name
              </label>
              <Input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-zinc-400" /> Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Planning Focus
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-zinc-900 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="host">💍 Wedding or Private Host</option>
                <option value="planner">🎂 Birthday & Family Celebrations Lead</option>
                <option value="community">🏘️ Community Festival Director</option>
                <option value="coordinator">🌟 Professional Event Producer</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-2">
              <span>Register & Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
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
