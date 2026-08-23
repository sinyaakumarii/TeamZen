// context/AuthContext.jsx
// This provides login state (current user, token) to the entire app.

import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Try to load an existing user from localStorage when the app starts
  const storedUser = localStorage.getItem('user');
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A custom hook to easily access auth data in any component
export function useAuth() {
  return useContext(AuthContext);
}