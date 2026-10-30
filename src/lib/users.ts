import crypto from 'crypto';
import { getDb, nowIso } from './db';
import type { User, UserRole } from '@/types';

export interface DbUserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: UserRole;
  role_label: string;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  host: 'Celebration Host',
  planner: 'Celebration Coordinator',
  community: 'Community Director',
  coordinator: 'Event & Mela Producer',
};

export const AVATAR_COLORS = [
  'bg-[#F7418F]',
  'bg-[#FC819E]',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
];

export const DEMO_USERS = [
  {
    id: 'usr_demo_1',
    name: 'Priya Sharma',
    email: 'host@celebratekaro.com',
    password: 'password123',
    role: 'host' as UserRole,
    role_label: 'Shaadi & Family Host',
    avatar_color: 'bg-[#F7418F]',
  },
  {
    id: 'usr_demo_2',
    name: 'Aarav Mehta',
    email: 'planner@celebratekaro.com',
    password: 'password123',
    role: 'planner' as UserRole,
    role_label: 'Celebration Coordinator',
    avatar_color: 'bg-indigo-600',
  },
  {
    id: 'usr_demo_3',
    name: 'Rajesh K. Gupta',
    email: 'producer@celebratekaro.com',
    password: 'password123',
    role: 'coordinator' as UserRole,
    role_label: 'Event & Mela Producer',
    avatar_color: 'bg-emerald-600',
  },
];

export function hashPasswordServer(password: string, salt: string): string {
  const combined = `${salt}::celebratekaro_secure::${password}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

export function generateSaltServer(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function sanitizeUser(doc: DbUserRecord): User {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    roleLabel: doc.role_label,
    avatarColor: doc.avatar_color,
    created_at: doc.created_at,
  };
}

/**
 * Seed official demo user accounts into MongoDB if they do not exist.
 */
export async function seedDemoUsersIfEmpty(): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection('users');

    for (const demo of DEMO_USERS) {
      const existing = await collection.findOne({ email: demo.email.toLowerCase() });
      if (!existing) {
        const salt = generateSaltServer();
        const password_hash = hashPasswordServer(demo.password, salt);
        const now = nowIso();
        const doc: DbUserRecord = {
          id: demo.id,
          name: demo.name,
          email: demo.email.toLowerCase(),
          password_hash,
          salt,
          role: demo.role,
          role_label: demo.role_label,
          avatar_color: demo.avatar_color,
          created_at: now,
          updated_at: now,
        };
        await collection.insertOne(doc);
      }
    }

    // Also assign any existing legacy events without user_id to demo user 1
    try {
      await db.collection('events').updateMany(
        { $or: [{ user_id: { $exists: false } }, { user_id: null }, { user_id: '' }] },
        { $set: { user_id: 'usr_demo_1' } }
      );
    } catch (err) {
      console.warn('[Users] Legacy events migration notice:', err);
    }
  } catch (err) {
    console.warn('[Users] seedDemoUsersIfEmpty notice:', err);
  }
}

/**
 * Find user by email in MongoDB.
 */
export async function findUserByEmail(email: string): Promise<DbUserRecord | null> {
  await seedDemoUsersIfEmpty();
  const db = await getDb();
  const normalized = email.trim().toLowerCase();
  const doc = await db.collection<DbUserRecord>('users').findOne({ email: normalized });
  return doc ?? null;
}

/**
 * Find user by ID in MongoDB.
 */
export async function findUserById(id: string): Promise<User | null> {
  await seedDemoUsersIfEmpty();
  const db = await getDb();
  const doc = await db.collection<DbUserRecord>('users').findOne({ id });
  return doc ? sanitizeUser(doc) : null;
}

/**
 * Create a new user in MongoDB Atlas.
 */
export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const role = input.role || 'host';

    if (!name) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!input.password || input.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    await seedDemoUsersIfEmpty();
    const db = await getDb();
    const collection = db.collection('users');

    const existing = await collection.findOne({ email });
    if (existing) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    const salt = generateSaltServer();
    const password_hash = hashPasswordServer(input.password, salt);
    const now = nowIso();

    const totalUsers = await collection.countDocuments();
    const avatar_color = AVATAR_COLORS[totalUsers % AVATAR_COLORS.length];
    const role_label = ROLE_LABELS[role] || 'Celebration Host';
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const userDoc: DbUserRecord = {
      id,
      name,
      email,
      password_hash,
      salt,
      role,
      role_label,
      avatar_color,
      created_at: now,
      updated_at: now,
    };

    await collection.insertOne(userDoc);

    return {
      success: true,
      user: sanitizeUser(userDoc),
    };
  } catch (err) {
    console.error('[Users] Error creating user:', err);
    return {
      success: false,
      error: 'Failed to create user account. Please try again.',
    };
  }
}

/**
 * Verify credentials and authenticate user from MongoDB Atlas.
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    await seedDemoUsersIfEmpty();
    const userRecord = await findUserByEmail(normalizedEmail);
    if (!userRecord) {
      return {
        success: false,
        error: 'No account found with this email. Please check your spelling or register a new account.',
      };
    }

    const inputHash = hashPasswordServer(password, userRecord.salt);
    if (inputHash !== userRecord.password_hash) {
      return {
        success: false,
        error: 'Incorrect password. Only the password created during registration can be used.',
      };
    }

    return {
      success: true,
      user: sanitizeUser(userRecord),
    };
  } catch (err) {
    console.error('[Users] Error verifying credentials:', err);
    return {
      success: false,
      error: 'Failed to verify credentials. Please try again.',
    };
  }
}
