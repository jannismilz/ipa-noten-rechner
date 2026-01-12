import { describe, test, expect, afterEach, vi } from 'vitest';
import { api } from '../services/api';

const mockFetch = vi.fn();

global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockClear();
});

// KI: Aus dem TESTKONZEPT.md generiert

describe('API Service Integration Tests', () => {
  describe('FE-IT-01: Login', () => {
    test('should login with credentials and return token', async () => {
      const mockResponse = {
        token: 'test-token-123',
        userId: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.login('testuser', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('should throw error on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(api.login('wrong', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('FE-IT-02: Get Criteria', () => {
    test('should fetch criteria data', async () => {
      const mockCriteria = {
        categories_with_weigth: [{ id: 'cat1', name: 'Category 1', weight: 0.5 }],
        criterias: [{ id: 'C1', category: 'cat1', title: 'Test Criteria' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCriteria,
      });

      const result = await api.getCriteria();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/evaluations/criteria'));
      expect(result).toEqual(mockCriteria);
    });

    test('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.getCriteria()).rejects.toThrow('Failed to fetch criteria');
    });
  });

  describe('Get Profile', () => {
    test('should fetch profile with token', async () => {
      const mockProfile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        user_id: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await api.getProfile('test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe('Update Profile', () => {
    test('should update profile with data', async () => {
      const mockUpdated = {
        id: 1,
        first_name: 'Jane',
        last_name: 'Doe',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated,
      });

      const result = await api.updateProfile('test-token', { firstName: 'Jane' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName: 'Jane' }),
        })
      );
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('Get Evaluations', () => {
    test('should fetch evaluations with token', async () => {
      const mockEvaluations = {
        categories: [],
        criterias: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvaluations,
      });

      const result = await api.getEvaluations('test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/evaluations'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
      expect(result).toEqual(mockEvaluations);
    });
  });

  describe('Save Evaluation', () => {
    test('should save evaluation data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await api.saveEvaluation('test-token', 'A1', {
        tickedRequirements: ['Req 1'],
        note: 'Test note',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/evaluations/A1'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tickedRequirements: ['Req 1'],
            note: 'Test note',
          }),
        })
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('Calculate Scores', () => {
    test('should fetch calculated scores', async () => {
      const mockScores = {
        categoryScores: {},
        finalGrade: 4.5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockScores,
      });

      const result = await api.calculateScores('test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/evaluations/calculate'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
      expect(result).toEqual(mockScores);
    });
  });
});
