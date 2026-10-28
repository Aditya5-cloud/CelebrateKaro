import type { User, UserRole } from '@/types';

const STORAGE_KEY_CURRENT_USER = 'celebration_current_user_v1';
const STORAGE_KEY_ALL_USERS = 'celebration_registered_users_v1';
const AUTH_CHANNEL_NAME = 'celebration_planner_auth_channel';

/**
 * Extended internal interface stored in localStorage,
 * which includes password salt and cryptographic hash.
 * These sensitive fields are NEVER leaked to the User interface or returned in session state.
 */
export interface StoredUserRecord extends User {
  passwordHash?: string;
  salt?: string;
}

/**
 * Built-in demo accounts so users or reviewers can test the application
 * immediately without having to manually register a new account.
 */
export const DEMO_ACCOUNTS = [
  {
    name: 'Priya Sharma',
    email: 'host@celebratekaro.com',
    password: 'password123',
    role: 'host' as UserRole,
    roleLabel: 'Shaadi & Family Host',
    description: 'Planning a royal family celebration',
  },
  {
    name: 'Aarav Mehta',
    email: 'planner@celebratekaro.com',
    password: 'password123',
    role: 'planner' as UserRole,
    roleLabel: 'Celebration Coordinator',
    description: 'Coordinating milestone Janamdins & Sangeet nights',
  },
  {
    name: 'Rajesh K. Gupta',
    email: 'producer@celebratekaro.com',
    password: 'password123',
    role: 'coordinator' as UserRole,
    roleLabel: 'Event & Mela Producer',
    description: 'Directing large Mahaprasad Bhandaras & community utsavs',
  },
];

/**
 * Generate a random salt for password hashing.
 */
export function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Cryptographically hash a password with its salt using SHA-256.
 * Seamlessly works in browser (WebCrypto API) and Node.js / Jest environments.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const combined = `${salt}::celebratekaro_secure::${password}`;

  // 1. Browser Web Crypto
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(combined);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fall through to fallback
    }
  }

  // 2. Global Web Crypto (Node.js 18+)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const data = new TextEncoder().encode(combined);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fall through to Node crypto
    }
  }

  // 3. Node.js built-in crypto (for Jest / server test runs)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    return nodeCrypto.createHash('sha256').update(combined).digest('hex');
  } catch {
    // 4. Reliable deterministic math hash fallback
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < combined.length; i++) {
      const ch = combined.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
}

/**
 * Return stored user records including internal credentials from localStorage.
 */
function getRawStoredUsers(): StoredUserRecord[] {
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
 * Persist raw stored user records to localStorage.
 */
function saveRawStoredUsers(users: StoredUserRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(users));
  } catch {
    // Ignore quota or private-browsing errors
  }
}

/**
 * Return all registered users from persistence, sanitized without passwords.
 */
export function getRegisteredUsers(): User[] {
  const stored = getRawStoredUsers();
  return stored.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    roleLabel: u.roleLabel,
    avatarColor: u.avatarColor,
    created_at: u.created_at,
  }));
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
 * Initialize demo users in localStorage if database of users is empty.
 */
export async function seedDemoAccountsIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return;
  const current = getRawStoredUsers();
  if (current.length > 0) return;

  const seeded: StoredUserRecord[] = [];
  const colors = ['bg-emerald-600', 'bg-teal-600', 'bg-indigo-600'];

  for (let i = 0; i < DEMO_ACCOUNTS.length; i++) {
    const demo = DEMO_ACCOUNTS[i];
    const salt = generateSalt();
    const passwordHash = await hashPassword(demo.password, salt);
    seeded.push({
      id: `usr_demo_${i + 1}`,
      name: demo.name,
      email: demo.email.toLowerCase().trim(),
      role: demo.role,
      roleLabel: demo.roleLabel,
      avatarColor: colors[i % colors.length],
      created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      salt,
      passwordHash,
    });
  }

  saveRawStoredUsers(seeded);
}

/**
 * Log in with email and password.
 * Checks against the registered password created during registration.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const trimmedEmail = email.toLowerCase().trim();
  if (!trimmedEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  // 1. Authenticate with backend MongoDB Atlas API when running in browser
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.user) {
        const cleanUser = json.data.user as User;
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cleanUser));
        broadcastAuthChange(cleanUser);
        return { success: true, user: cleanUser };
      } else if (!res.ok && json.error) {
        return { success: false, error: json.error };
      }
    } catch {
      // Network failure or test runner fallback to local storage
    }
  }

  // 2. Fallback to local storage (for unit tests / offline development)
  await seedDemoAccountsIfEmpty();

  const storedUsers = getRawStoredUsers();
  const matched = storedUsers.find((u) => u.email.toLowerCase().trim() === trimmedEmail);

  if (!matched) {
    return {
      success: false,
      error: 'No account found with this email. Please check your spelling or register a new account.',
    };
  }

  // If user was created under legacy version without a password, enroll password now
  if (!matched.passwordHash || !matched.salt) {
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    matched.salt = salt;
    matched.passwordHash = passwordHash;
    saveRawStoredUsers(storedUsers);
  } else {
    // Verify password hash
    const inputHash = await hashPassword(password, matched.salt);
    if (inputHash !== matched.passwordHash) {
      return {
        success: false,
        error: 'Incorrect password. Only the password created during registration can be used.',
      };
    }
  }

  const cleanUser: User = {
    id: matched.id,
    name: matched.name,
    email: matched.email,
    role: matched.role,
    roleLabel: matched.roleLabel,
    avatarColor: matched.avatarColor,
    created_at: matched.created_at,
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cleanUser));
  }
  broadcastAuthChange(cleanUser);
  return { success: true, user: cleanUser };
}

/**
 * Register a new user account with secure password and log them in immediately.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'host'
): Promise<{ success: boolean; user?: User; error?: string }> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please choose a password.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // 1. Create account in MongoDB Atlas when running in browser
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          role,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.user) {
        const cleanUser = json.data.user as User;
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cleanUser));

        // Mirror locally for offline resilience
        const storedUsers = getRawStoredUsers();
        if (!storedUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
          storedUsers.push({ ...cleanUser });
          saveRawStoredUsers(storedUsers);
        }

        broadcastAuthChange(cleanUser);
        return { success: true, user: cleanUser };
      } else if (!res.ok && json.error) {
        return { success: false, error: json.error };
      }
    } catch {
      // Fallback for tests or offline
    }
  }

  // 2. Fallback to local storage (for unit tests / offline development)
  const storedUsers = getRawStoredUsers();
  const duplicate = storedUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (duplicate) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const roleLabels: Record<UserRole, string> = {
    host: 'Event Host',
    planner: 'Celebration Coordinator',
    community: 'Community Director',
    coordinator: 'Celebration Producer',
  };

  const colors = [
    'bg-emerald-600',
    'bg-teal-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-blue-600',
  ];
  const avatarColor = colors[storedUsers.length % colors.length];

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newStoredUser: StoredUserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    email: trimmedEmail,
    role,
    roleLabel: roleLabels[role] || 'Event Organizer',
    avatarColor,
    created_at: new Date().toISOString(),
    salt,
    passwordHash,
  };

  const updatedUsers = [...storedUsers, newStoredUser];
  saveRawStoredUsers(updatedUsers);

  const cleanUser: User = {
    id: newStoredUser.id,
    name: newStoredUser.name,
    email: newStoredUser.email,
    role: newStoredUser.role,
    roleLabel: newStoredUser.roleLabel,
    avatarColor: newStoredUser.avatarColor,
    created_at: newStoredUser.created_at,
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cleanUser));
  }
  broadcastAuthChange(cleanUser);

  return { success: true, user: cleanUser };
}

/**
 * Log out current session.
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
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
