import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); // Admin, Alumni, Visitor
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserRole(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ userRole, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};