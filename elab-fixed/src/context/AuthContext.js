import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('elab_token');
    const storedUser = localStorage.getItem('elab_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('elab_token', tokenValue);
    localStorage.setItem('elab_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('elab_token');
    localStorage.removeItem('elab_user');
  };

  const role = user?.roles?.[0] || null;
  const isAdmin = role === 'Admin';
  const isStaff = role === 'Staff';
  const isPatient = role === 'Patient';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, role, isAdmin, isStaff, isPatient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
