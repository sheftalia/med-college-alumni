import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage and fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to fetch user data', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isRegisteredAlumni = () => user?.role === 'registered_alumni';
  const isAppliedAlumni = () => user?.role === 'applied_alumni';
  const isVisitor = () => user?.role === 'visitor';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isRegisteredAlumni,
        isAppliedAlumni,
        isVisitor,
        isLoggedIn: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};