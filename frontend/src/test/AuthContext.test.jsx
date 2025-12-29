import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    login: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getCriteria: vi.fn(),
    getEvaluations: vi.fn(),
    saveEvaluation: vi.fn(),
    calculateScores: vi.fn(),
  },
}));

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();

    // Set default mock implementations to prevent errors
    api.getProfile.mockResolvedValue({});
    api.login.mockResolvedValue({});
    api.updateProfile.mockResolvedValue({});
  });

  describe('FE-IT-05: Login Flow', () => {
    test('should update user state and store token on login', async () => {
      const mockLoginResponse = {
        token: 'test-token-123',
        userId: 1,
      };
      const mockProfile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        user_id: 1,
      };

      api.login.mockResolvedValue(mockLoginResponse);
      api.getProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('testuser', 'password123');

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
        expect(result.current.token).toBe('test-token-123');
        expect(result.current.isAuthenticated).toBe(true);
        expect(localStorage.getItem('token')).toBe('test-token-123');
      });

      expect(api.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(api.getProfile).toHaveBeenCalledWith('test-token-123');
    });

    test('should throw error on failed login', async () => {
      api.login.mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.login('wrong', 'wrong')).rejects.toThrow('Invalid credentials');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('FE-IT-06: Logout Flow', () => {
    test('should clear user state and remove token on logout', async () => {
      const mockLoginResponse = {
        token: 'test-token-123',
        userId: 1,
      };
      const mockProfile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        user_id: 1,
      };

      api.login.mockResolvedValue(mockLoginResponse);
      api.getProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('testuser', 'password123');

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      result.current.logout();

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    test('should work when user is not logged in', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      result.current.logout();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Token Persistence', () => {
    test('should restore session from stored token on mount', async () => {
      const mockProfile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        user_id: 1,
      };

      localStorage.setItem('token', 'existing-token');
      api.getProfile.mockResolvedValueOnce(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockProfile);
      expect(result.current.token).toBe('existing-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(api.getProfile).toHaveBeenCalledWith('existing-token');
    });

    test('should clear invalid token on mount', async () => {
      localStorage.setItem('token', 'invalid-token');
      api.getProfile.mockRejectedValueOnce(new Error('Invalid token'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Update Profile', () => {
    test('should update user state with new profile data', async () => {
      const mockLoginResponse = {
        token: 'test-token-123',
        userId: 1,
      };
      const mockProfile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        user_id: 1,
      };
      const updatedProfile = {
        id: 1,
        first_name: 'Jane',
        last_name: 'Doe',
        user_id: 1,
      };

      api.login.mockResolvedValue(mockLoginResponse);
      api.getProfile.mockResolvedValue(mockProfile);
      api.updateProfile.mockResolvedValue(updatedProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('testuser', 'password123');

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
      });

      await result.current.updateProfile({ firstName: 'Jane' });

      await waitFor(() => {
        expect(result.current.user).toEqual(updatedProfile);
      });

      expect(api.updateProfile).toHaveBeenCalledWith('test-token-123', { firstName: 'Jane' });
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useAuth is used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
    });
  });
});
