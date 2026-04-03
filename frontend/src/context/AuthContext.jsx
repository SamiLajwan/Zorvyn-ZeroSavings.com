import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return token ? { token, username, role } : null;
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    setUser(data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const can = (action) => {
    if (!user) return false;
    const role = user.role;
    if (role === 'ADMIN') return true;
    if (role === 'ANALYST') return action !== 'manage_users';
    if (role === 'VIEWER') return action === 'view';
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
