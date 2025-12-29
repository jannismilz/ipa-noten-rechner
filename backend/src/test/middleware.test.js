import { describe, test, expect } from 'bun:test';
import jwt from 'jsonwebtoken';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

describe('Auth Middleware', () => {
  describe('authMiddleware', () => {
    test('should pass with valid token', async () => {
      const token = jwt.sign({ userId: 123 }, JWT_SECRET, { expiresIn: '7d' });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {
        status: code => ({
          json: data => ({ status: code, data }),
        }),
      };
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await authMiddleware(req, res, next);

      expect(nextCalled).toBe(true);
      expect(req.userId).toBe(123);
    });

    test('should reject missing authorization header', async () => {
      const req = { headers: {} };
      let response;
      const res = {
        status: code => ({
          json: data => {
            response = { status: code, data };
            return response;
          },
        }),
      };
      const next = () => {};

      await authMiddleware(req, res, next);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('No token provided');
    });

    test('should reject malformed authorization header', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };
      let response;
      const res = {
        status: code => ({
          json: data => {
            response = { status: code, data };
            return response;
          },
        }),
      };
      const next = () => {};

      await authMiddleware(req, res, next);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('No token provided');
    });

    test('should reject invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      let response;
      const res = {
        status: code => ({
          json: data => {
            response = { status: code, data };
            return response;
          },
        }),
      };
      const next = () => {};

      await authMiddleware(req, res, next);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Invalid token');
    });

    test('should reject expired token', async () => {
      const token = jwt.sign({ userId: 123 }, JWT_SECRET, { expiresIn: '-1s' });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      let response;
      const res = {
        status: code => ({
          json: data => {
            response = { status: code, data };
            return response;
          },
        }),
      };
      const next = () => {};

      await authMiddleware(req, res, next);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Invalid token');
    });
  });

  describe('optionalAuth', () => {
    test('should pass with valid token and set userId', async () => {
      const token = jwt.sign({ userId: 456 }, JWT_SECRET, { expiresIn: '7d' });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await optionalAuth(req, res, next);

      expect(nextCalled).toBe(true);
      expect(req.userId).toBe(456);
    });

    test('should pass without token', async () => {
      const req = { headers: {} };
      const res = {};
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await optionalAuth(req, res, next);

      expect(nextCalled).toBe(true);
      expect(req.userId).toBeUndefined();
    });

    test('should pass with invalid token and set userId to null', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      const res = {};
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await optionalAuth(req, res, next);

      expect(nextCalled).toBe(true);
      expect(req.userId).toBe(null);
    });

    test('should pass with malformed header', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };
      const res = {};
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await optionalAuth(req, res, next);

      expect(nextCalled).toBe(true);
      expect(req.userId).toBeUndefined();
    });
  });
});
