import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('strapiToken');
      if (token) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('strapiToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/auth/local`, {
        identifier,
        password
      });

      const { jwt, user } = response.data;
      localStorage.setItem('strapiToken', jwt);
      setUser(user);
      setIsAuthenticated(true);

      return { user, jwt };
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('strapiToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);