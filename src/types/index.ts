/**
 * Shared TypeScript types for the Celebration & Event Planner.
 * These types are shared between client and server — keep them serialisation-safe
 * (no Date objects, no class instances).
 */

// ─── Event Types ─────────────────────────────────────────────────────────────

export type EventType = 'wedding' | 'birthday' | 'community' | 'other';

export interface Event {
  id: number;
  name: string;
  event_type: EventType;
  event_date: string; // ISO 8601 date string (YYYY-MM-DD)
  guest_count: number;
  total_budget: number; // stored in cents to avoid float arithmetic issues
  description: string;
  created_at: string; // ISO 8601 datetime
  updated_at: string;
}

export type CreateEventInput = Omit<Event, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEventInput = Partial<CreateEventInput>;

// ─── Budget Category Types ────────────────────────────────────────────────────

export type BudgetCategoryName =
  | 'venue'
  | 'catering'
  | 'music'
  | 'decoration'
  | 'photography'
  | 'attire'
  | 'transportation'
  | 'invitations'
  | 'misc';

export interface BudgetCategory {
  id: number;
  event_id: number;
  name: BudgetCategoryName | string;
  planned_amount: number; // cents
  actual_amount: number; // cents
  notes: string;
  created_at: string;
  updated_at: string;
}

export type CreateBudgetCategoryInput = Omit<BudgetCategory, 'id' | 'created_at' | 'updated_at'>;

// ─── Milestone Types ──────────────────────────────────────────────────────────

export interface Milestone {
  id: number;
  event_id: number;
  title: string;
  description: string;
  due_date: string; // ISO 8601 date string
  completed: boolean; // stored as 0/1 in SQLite
  created_at: string;
  updated_at: string;
}

export type CreateMilestoneInput = Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;

// ─── Vendor Types ─────────────────────────────────────────────────────────────

export type VendorStatus = 'considering' | 'contacted' | 'booked' | 'paid' | 'cancelled';

export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'music'
  | 'florist'
  | 'bakery'
  | 'transportation'
  | 'decoration'
  | 'officiant'
  | 'other';

export interface Vendor {
  id: number;
  event_id: number;
  name: string;
  category: VendorCategory | string;
  status: VendorStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  price_quote: number; // cents; 0 if unknown
  notes: string;
  created_at: string;
  updated_at: string;
}

export type CreateVendorInput = Omit<Vendor, 'id' | 'created_at' | 'updated_at'>;

// ─── AI Checklist Types ───────────────────────────────────────────────────────

export interface ChecklistItem {
  id: number;
  event_id: number;
  category: string;
  task: string;
  completed: boolean;
  ai_generated: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateChecklistItemInput = Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'>;

// ─── Chat Types ───────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: number;
  event_id: number;
  role: ChatRole;
  content: string;
  created_at: string;
}

export type CreateChatMessageInput = Omit<ChatMessage, 'id' | 'created_at'>;

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── User Types (Multi-User) ──────────────────────────────────────────────────

export type UserRole = 'host' | 'coordinator' | 'community' | 'planner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarColor: string;
  created_at: string;
}

