const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  async getProfile(token) {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    return response.json();
  },

  async updateProfile(token, data) {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    return response.json();
  },

  async getCriteria() {
    const response = await fetch(`${API_URL}/evaluations/criteria`);
    if (!response.ok) {
      throw new Error('Failed to fetch criteria');
    }
    return response.json();
  },

  async getEvaluations(token) {
    const response = await fetch(`${API_URL}/evaluations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch evaluations');
    }
    return response.json();
  },

  async saveEvaluation(token, criteriaId, data) {
    const response = await fetch(`${API_URL}/evaluations/${criteriaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save evaluation');
    }
    return response.json();
  },

  async calculateScores(token) {
    const response = await fetch(`${API_URL}/evaluations/calculate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate scores');
    }
    return response.json();
  }
};
