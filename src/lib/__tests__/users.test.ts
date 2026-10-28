import { getDb, clearDatabase, closeDb } from '../db';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyUserCredentials,
  seedDemoUsersIfEmpty,
} from '../users';
import { createEvent, getEvents } from '../events';

describe('Users & Data Isolation Service', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('User Persistence & Credential Verification', () => {
    it('creates a user with hashed password and does not expose sensitive fields', async () => {
      const res = await createUser({
        name: 'Kabir Sharma',
        email: 'kabir@example.com',
        password: 'password123',
        role: 'host',
      });

      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.id).toMatch(/^usr_/);
      expect(res.user?.name).toBe('Kabir Sharma');
      expect(res.user?.email).toBe('kabir@example.com');
      expect((res.user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      expect((res.user as unknown as Record<string, unknown>).salt).toBeUndefined();

      // Verify db record has salt and hash
      const dbUser = await findUserByEmail('kabir@example.com');
      expect(dbUser).not.toBeNull();
      expect(dbUser?.password_hash).toBeDefined();
      expect(dbUser?.salt).toBeDefined();
    });

    it('rejects duplicate email registrations', async () => {
      const res1 = await createUser({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'host',
      });
      expect(res1.success).toBe(true);

      const res2 = await createUser({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'planner',
      });
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/already exists/i);
    });

    it('verifies valid user credentials and rejects invalid ones', async () => {
      const res = await createUser({
        name: 'Ananya Roy',
        email: 'ananya@example.com',
        password: 'mySecretPassword99',
        role: 'coordinator',
      });
      expect(res.success).toBe(true);

      const validResult = await verifyUserCredentials('ananya@example.com', 'mySecretPassword99');
      expect(validResult.success).toBe(true);
      expect(validResult.user?.name).toBe('Ananya Roy');

      const wrongPassResult = await verifyUserCredentials('ananya@example.com', 'wrongpassword');
      expect(wrongPassResult.success).toBe(false);
      expect(wrongPassResult.user).toBeUndefined();

      const nonExistentResult = await verifyUserCredentials('nobody@example.com', 'mypassword');
      expect(nonExistentResult.success).toBe(false);
      expect(nonExistentResult.user).toBeUndefined();
    });

    it('finds user by ID and by email with case-insensitivity', async () => {
      const res = await createUser({
        name: 'Vikram Joshi',
        email: 'Vikram.Joshi@example.com',
        password: 'password123',
        role: 'host',
      });
      expect(res.success).toBe(true);
      const userId = res.user!.id;

      const byId = await findUserById(userId);
      expect(byId?.name).toBe('Vikram Joshi');

      const byEmail = await findUserByEmail('vikram.joshi@example.com');
      expect(byEmail?.id).toBe(userId);
    });

    it('seeds built-in demo users when empty', async () => {
      await seedDemoUsersIfEmpty();

      const demo1 = await findUserByEmail('host@celebratekaro.com');
      const demo2 = await findUserByEmail('planner@celebratekaro.com');
      const demo3 = await findUserByEmail('producer@celebratekaro.com');

      expect(demo1).not.toBeNull();
      expect(demo2).not.toBeNull();
      expect(demo3).not.toBeNull();
    });
  });

  describe('Multi-Tenant Celebration Data Isolation', () => {
    it('strictly isolates celebrations between different users', async () => {
      const resA = await createUser({
        name: 'User A',
        email: 'usera@example.com',
        password: 'password123',
        role: 'host',
      });
      const userA = resA.user!;

      const resB = await createUser({
        name: 'User B',
        email: 'userb@example.com',
        password: 'password123',
        role: 'planner',
      });
      const userB = resB.user!;

      // User A creates 2 celebrations
      const eventA1 = await createEvent(
        {
          name: "User A's Sangeet Night",
          event_type: 'wedding',
          event_date: '2027-11-20',
          guest_count: 200,
          total_budget: 15000,
          description: '',
        },
        userA.id
      );

      const eventA2 = await createEvent(
        {
          name: "User A's Reception",
          event_type: 'wedding',
          event_date: '2027-11-22',
          guest_count: 350,
          total_budget: 25000,
          description: '',
        },
        userA.id
      );

      // User B creates 1 celebration
      const eventB1 = await createEvent(
        {
          name: "User B's 40th Birthday",
          event_type: 'birthday',
          event_date: '2027-12-05',
          guest_count: 50,
          total_budget: 5000,
          description: '',
        },
        userB.id
      );

      // Verify User A only sees User A's celebrations
      const eventsForA = await getEvents({ userId: userA.id });
      expect(eventsForA.length).toBe(2);
      expect(eventsForA.map((e) => e.id)).toEqual(
        expect.arrayContaining([eventA1.id, eventA2.id])
      );
      expect(eventsForA.find((e) => e.id === eventB1.id)).toBeUndefined();

      // Verify User B only sees User B's celebrations
      const eventsForB = await getEvents({ userId: userB.id });
      expect(eventsForB.length).toBe(1);
      expect(eventsForB[0].id).toBe(eventB1.id);
      expect(eventsForB[0].name).toBe("User B's 40th Birthday");
      expect(eventsForB.find((e) => e.id === eventA1.id)).toBeUndefined();

      // Verify a new registered user sees 0 celebrations
      const resC = await createUser({
        name: 'User C',
        email: 'userc@example.com',
        password: 'password123',
        role: 'host',
      });
      const userC = resC.user!;
      const eventsForC = await getEvents({ userId: userC.id });
      expect(eventsForC.length).toBe(0);
    });
  });
});
