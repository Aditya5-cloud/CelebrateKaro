/**
 * Database Module for CelebrateKaro.
 *
 * Configured for MongoDB Atlas with fallback in-memory database for testing and offline development.
 *
 * This module is SERVER-ONLY. It must never be imported from client components.
 */

export {
  getDb,
  getNextSequence,
  closeDb,
  clearDatabase,
  nowIso,
  toCents,
  fromCents,
  DEFAULT_DB_NAME,
} from './mongodb';
