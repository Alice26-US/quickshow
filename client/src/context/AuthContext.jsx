import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the env var or default to the standard URL structure
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Set axios defaults for this initial request
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await axios.get(`${API_URL}/auth/me`);
          if (res.data.success) {
             setUser(res.data.user);
          }
        } catch (error) {
          console.error("Error fetching user data", error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        // Set context and localStorage 
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      if (res.data.success) {
        // Set context and localStorage
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
