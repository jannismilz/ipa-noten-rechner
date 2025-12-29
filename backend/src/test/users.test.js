import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import jwt from 'jsonwebtoken';
import { setupTestDatabase, cleanupTestDatabase, createTestUser } from './setup.js';

const API_URL = 'http://localhost:3001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let testUser;
let authToken;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

beforeEach(async () => {
  testUser = await createTestUser('profiletest', 'password123');
  authToken = jwt.sign({ userId: testUser.id }, JWT_SECRET, { expiresIn: '7d' });
});

describe('User Profile Routes', () => {
  describe('GET /api/users/profile', () => {
    test('should get user profile with valid token', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('first_name');
      expect(data).toHaveProperty('last_name');
      expect(data).toHaveProperty('topic');
      expect(data).toHaveProperty('submission_date');
      expect(data.user_id).toBe(testUser.id);
    });

    test('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/users/profile`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });

    test('should reject request with invalid token', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid token');
    });

    test('should reject request with malformed authorization header', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: 'InvalidFormat token',
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });
  });

  describe('PUT /api/users/profile', () => {
    test('should update user profile', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          topic: 'Web Development',
          submissionDate: '2024-12-31',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.first_name).toBe('John');
      expect(data.last_name).toBe('Doe');
      expect(data.topic).toBe('Web Development');
    });

    test('should partially update user profile', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Jane',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.first_name).toBe('Jane');
      expect(data.last_name).toBe('User');
    });

    test('should reject update without token', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });

    test('should handle empty update', async () => {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('first_name');
      expect(data).toHaveProperty('last_name');
    });
  });
});
