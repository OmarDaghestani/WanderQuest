import api from "../lib/api";
import { storage } from "../utils/storage.utils";
import { parseApiError } from "../utils/error.utils";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;
      storage.set("token", token);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  register: async (email, password) => {
    try {
      const response = await api.post("/auth/register", { email, password });
      const { token } = response.data;
      storage.set("token", token);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  logout: () => {
    storage.remove("token");
  },
};
