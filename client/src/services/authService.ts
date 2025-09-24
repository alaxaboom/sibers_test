import { User, UsersResponse, AuthResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  setToken(token: string): void {
    localStorage.setItem("token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  removeToken(): void {
    localStorage.removeItem("token");
  },

  getCurrentUserSync(): User | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.id.toString(),
        username: payload.username,
        role: payload.role || "user",
        email: "", // Dummy, но full в async
      } as User;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    return await response.json();
  },

  async register(
    userData: Omit<User, "id"> & { password: string }
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    return await response.json();
  },

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) this.removeToken();
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user");
    }

    return await response.json();
  },

  async getUsersQuery(query: string): Promise<UsersResponse> {
    const token = this.getToken();
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) this.removeToken();
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return await response.json();
  },

  async getUserById(id: string): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) this.removeToken();
      const error = await response.json();
      throw new Error(error.message || "User not found");
    }

    return await response.json();
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) this.removeToken();
      const error = await response.json();
      throw new Error(error.message || "Update failed");
    }

    return await response.json();
  },

  async createUser(
    userData: Omit<User, "id"> & { password: string }
  ): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) this.removeToken();
      const error = await response.json();
      throw new Error(error.message || "Create failed");
    }

    return await response.json();
  },

  async deleteUser(userId: string): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) this.removeToken();
      const error = await response.json();
      throw new Error(error.message || "Delete failed");
    }
  },
};
