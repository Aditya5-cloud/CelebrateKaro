import {
  registerUser,
  loginUser,
  getCurrentUser,
  getRegisteredUsers,
  logoutUser,
  hashPassword,
  generateSalt,
} from '../auth';

describe('Auth Service & Password Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Password Hashing & Salt Generation', () => {
    it('generates a unique salt', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).toBeTruthy();
      expect(salt2).toBeTruthy();
      expect(salt1).not.toBe(salt2);
    });

    it('consistently hashes the same password and salt', async () => {
      const salt = 'testsalt123';
      const hash1 = await hashPassword('SecretPass!23', salt);
      const hash2 = await hashPassword('SecretPass!23', salt);
      expect(hash1).toBe(hash2);
    });

    it('generates different hashes for different passwords with the same salt', async () => {
      const salt = 'testsalt123';
      const hash1 = await hashPassword('PasswordA', salt);
      const hash2 = await hashPassword('PasswordB', salt);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Registration & Password Enforcement', () => {
    it('registers a user with a valid password', async () => {
      const res = await registerUser('Jane Doe', 'jane@example.com', 'securepass123', 'host');
      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.name).toBe('Jane Doe');
      expect(res.user?.email).toBe('jane@example.com');
      expect(res.user?.role).toBe('host');

      // Sensitive fields must never be leaked on User
      expect((res.user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      expect((res.user as unknown as Record<string, unknown>).salt).toBeUndefined();
    });

    it('rejects passwords shorter than 6 characters', async () => {
      const res = await registerUser('Short Pass', 'short@example.com', '12345', 'planner');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/at least 6 characters/i);
    });

    it('rejects registration with invalid email', async () => {
      const res = await registerUser('No Email', 'invalid-email', 'securepass123', 'host');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/valid email/i);
    });

    it('rejects duplicate email registrations', async () => {
      await registerUser('User One', 'dup@example.com', 'mypassword', 'host');
      const dupRes = await registerUser('User Two', 'dup@example.com', 'anotherpassword', 'host');
      expect(dupRes.success).toBe(false);
      expect(dupRes.error).toMatch(/already exists/i);
    });
  });

  describe('Login Password Verification', () => {
    beforeEach(async () => {
      await registerUser('Alex Smith', 'alex@example.com', 'SuperSecret99', 'host');
      logoutUser(); // Ensure no active session before testing login
    });

    it('successfully logs in when the registered password is provided', async () => {
      const res = await loginUser('alex@example.com', 'SuperSecret99');
      expect(res.success).toBe(true);
      expect(res.user?.email).toBe('alex@example.com');
      expect(getCurrentUser()?.email).toBe('alex@example.com');
    });

    it('REJECTS login when an incorrect password is provided (fixes bug)', async () => {
      const res = await loginUser('alex@example.com', 'WrongPassword123');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/incorrect password/i);
      expect(res.user).toBeUndefined();
      // Current user should remain null
      expect(getCurrentUser()).toBeNull();
    });

    it('rejects login when password is blank', async () => {
      const res = await loginUser('alex@example.com', '');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/enter your password/i);
    });

    it('rejects login for unknown email', async () => {
      const res = await loginUser('unknown@example.com', 'AnyPassword');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/no account found/i);
    });

    it('is case-insensitive for email during login', async () => {
      const res = await loginUser('ALEX@EXAMPLE.COM', 'SuperSecret99');
      expect(res.success).toBe(true);
      expect(res.user?.email).toBe('alex@example.com');
    });
  });

  describe('Logout & Session State', () => {
    it('clears current user on logout', async () => {
      await registerUser('Tester', 'tester@example.com', 'testpass123', 'host');
      expect(getCurrentUser()).not.toBeNull();
      logoutUser();
      expect(getCurrentUser()).toBeNull();
    });

    it('returns sanitized registered users list without password hashes', async () => {
      await registerUser('User A', 'a@example.com', 'passAAA111', 'host');
      await registerUser('User B', 'b@example.com', 'passBBB222', 'planner');

      const all = getRegisteredUsers();
      expect(all.length).toBe(2);
      expect(all[0].email).toBe('a@example.com');
      expect((all[0] as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      expect((all[0] as unknown as Record<string, unknown>).salt).toBeUndefined();
    });
  });
});
