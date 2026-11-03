import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { authService } from "../services";
import { storage } from "../utils/storage.utils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = storage.get("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.getProfile();
      setUser(userData);
    } catch (err) {
      console.error("Auth check error:", err);
      setError(err.message || "Authentication failed");
      storage.remove("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      await checkAuth();
      return response;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.register(email, password);
      await checkAuth();
      return response;
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storage.remove("token");
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profile) => {
    const updatedUser = await authService.updateProfile(profile);
    setUser((current) => ({ ...current, ...updatedUser }));
    return updatedUser;
  };

  const changePassword = (currentPassword, newPassword) =>
    authService.changePassword(currentPassword, newPassword);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
