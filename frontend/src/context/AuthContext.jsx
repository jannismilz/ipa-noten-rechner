import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api
        .getProfile(token)
        .then(profile => setUser(profile))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const profile = await api.getProfile(data.token);
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async data => {
    const updated = await api.updateProfile(token, data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
