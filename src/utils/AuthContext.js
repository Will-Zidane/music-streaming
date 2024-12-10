//  utils/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create an axios instance with default config
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
    timeout: 15000,
  });

  // Add auth token to all requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("strapiToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle auth errors globally
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("strapiToken");
        setUser(null);
        setIsAuthenticated(false);
      }
      return Promise.reject(error);
    },
  );

  const processUserData = (userData) => {
    if (!userData) return null;

    // Process avatar URL if it exists
    if (userData.avatar?.url) {
      userData.avatar.url = userData.avatar.url.startsWith("http")
        ? userData.avatar.url
        : `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${userData.avatar.url}`;
    }

    return userData;
  };

  const fetchUserData = async (token) => {
    try {
      const response = await api.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          populate: "*",
        },
      });
      return processUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("strapiToken");
      if (token) {
        try {
          const userData = await fetchUserData(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("strapiToken");
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


      const response = await api.post("/api/auth/local", {
        identifier,
        password,
      });


      const { jwt } = response.data;
      localStorage.setItem("strapiToken", jwt);

      // Fetch full user data after login
      const userData = await fetchUserData(jwt);
      console.log("Fetched user data:", userData);

      // Now, call the new /api/recombee/getUserRecombee API
      const userId = userData.id; // Assuming userData has an id field that is used as userId
      console.log(`Current User ID: ${userId}`);

      setUser(userData);
      setIsAuthenticated(true);



      // Replace the GET request with a POST request
      const userRecombeeResponse = await axios.post(
        "/api/recombee/getUserRecombee",
        {
          userId: userId,
          userData: userData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );


      return { user: userData, jwt };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/api/auth/local/register", {
        username,
        email,
        password,
      });

      // Assuming `response.data.user` contains the user data, including the playlists.
      const userData = response.data.user;

      // Ensure `playlists` is provided or set to an empty array if not present
      const playlists = userData?.playlists || [];

      // Send the user data and playlists to Recombee
      await axios.post(
        "api/recombee/addUserToRecombee",
        {
          userData: userData,
          playlists: playlists,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Registration logic remains the same
    } catch (error) {
      console.error("Registration failed:", {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2), // Detailed JSON parsing
        headers: error.response?.headers,
        message: error.message,
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("strapiToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (newData) => {
    if (!user?.id) {
      throw new Error("No authenticated user found");
    }

    try {
      const response = await api.put(`/api/users/${user.id}`, newData);
      const updatedUserData = processUserData(response.data);
      setUser(updatedUserData);
      return updatedUserData;
    } catch (error) {
      console.error("Update user failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("strapiToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const userData = await fetchUserData(token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error(
        "Refresh user failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      // Make a request to Strapi's password reset endpoint
      const response = await api.post("/api/auth/forgot-password", {
        email,
      });

      // Strapi's forgot password endpoint typically returns a simple success response
      return response.data;
    } catch (error) {
      console.error("Password reset failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Rethrow the error to be handled by the calling component
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        updateUser,
        refreshUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
