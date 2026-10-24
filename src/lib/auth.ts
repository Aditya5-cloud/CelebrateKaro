import type { User, UserRole } from '@/types';

const STORAGE_KEY_CURRENT_USER = 'celebration_current_user_v1';
const STORAGE_KEY_ALL_USERS = 'celebration_registered_users_v1';
const AUTH_CHANNEL_NAME = 'celebration_planner_auth_channel';

/**
 * Return all registered users from persistence.
 */
export function getRegisteredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Get the currently logged-in user, or null if guest / not logged in.
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * Broadcast an auth change to all open browser windows/tabs in real time.
 */
function broadcastAuthChange(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('celebration_auth_state_changed', { detail: { user } }));

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage({ type: 'AUTH_STATE_CHANGED', user });
      channel.close();
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * Log in as an existing user by email.
 */
export function loginUser(email: string): { success: boolean; user?: User; error?: string } {
  const trimmedEmail = email.toLowerCase().trim();
  if (!trimmedEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }

  const users = getRegisteredUsers();
  const matched = users.find((u) => u.email.toLowerCase().trim() === trimmedEmail);
  if (!matched) {
    return {
      success: false,
      error: 'No account found with this email. Please register to create your dashboard.',
    };
  }

  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(matched));
  broadcastAuthChange(matched);
  return { success: true, user: matched };
}

/**
 * Register a new production user account and log them in immediately.
 */
export function registerUser(
  name: string,
  email: string,
  role: UserRole = 'host'
): { success: boolean; user?: User; error?: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  const existingUsers = getRegisteredUsers();
  const duplicate = existingUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (duplicate) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  const roleLabels: Record<UserRole, string> = {
    host: 'Event Host',
    planner: 'Event Coordinator',
    community: 'Community Director',
    coordinator: 'Celebration Producer',
  };

  const colors = [
    'bg-violet-600',
    'bg-indigo-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-emerald-600',
    'bg-teal-600',
    'bg-blue-600',
  ];
  const avatarColor = colors[existingUsers.length % colors.length];

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    email: trimmedEmail,
    role,
    roleLabel: roleLabels[role] || 'Event Organizer',
    avatarColor,
    created_at: new Date().toISOString(),
  };

  const updatedUsers = [...existingUsers, newUser];
  localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(updatedUsers));
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
  broadcastAuthChange(newUser);

  return { success: true, user: newUser };
}

/**
 * Log out current session.
 */
export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  broadcastAuthChange(null);
}

/**
 * Subscribe to real-time authentication events across all tabs.
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<{ user: User | null }>;
    callback(custom.detail?.user ?? null);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_CURRENT_USER) {
      try {
        const user = e.newValue ? JSON.parse(e.newValue) : null;
        callback(user);
      } catch {
        callback(null);
      }
    }
  };

  window.addEventListener('celebration_auth_state_changed', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === 'AUTH_STATE_CHANGED') {
        callback(event.data.user ?? null);
      }
    };
  }

  return () => {
    window.removeEventListener('celebration_auth_state_changed', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (channel) {
      channel.close();
    }
  };
}
