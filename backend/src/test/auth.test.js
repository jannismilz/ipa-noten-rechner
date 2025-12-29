import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, deleteTestUser } from './setup.js';

const API_URL = 'http://localhost:3001/api';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const user = await createTestUser('logintest', 'password123');

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'logintest',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('userId');
      expect(data.userId).toBe(user.id);

      await deleteTestUser(user.id);
    });

    test('should reject invalid username', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'nonexistent',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const user = await createTestUser('passwordtest', 'correctpassword');

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'passwordtest',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');

      await deleteTestUser(user.id);
    });

    test('should reject missing username', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Username and password required');
    });

    test('should reject missing password', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Username and password required');
    });
  });
});
