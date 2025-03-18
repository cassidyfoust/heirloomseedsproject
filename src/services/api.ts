import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export interface Seed {
  id: number;
  name: string;
  description: string;
  category: string;
  growing_season: string;
  days_to_maturity: number;
  planting_depth: number;
  spacing_inches: number;
  quantity_available: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export const api = {
  // Get all seeds with optional filtering and pagination
  async getSeeds(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Seed[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/seeds?${queryParams}`);
    if (!response.ok) {
      throw new Error("Failed to fetch seeds");
    }
    return response.json();
  },

  // Get all categories
  async getCategories() {
    const response = await axios.get(`${API_BASE_URL}/seeds/categories`);
    return response.data;
  },

  // Get a single seed by ID
  async getSeedById(id: number) {
    const response = await axios.get(`${API_BASE_URL}/seeds/${id}`);
    return response.data;
  },

  // Create a new seed
  async createSeed(seed: Omit<Seed, "id" | "created_at" | "updated_at">) {
    const response = await axios.post(`${API_BASE_URL}/seeds`, seed);
    return response.data;
  },

  // Update a seed
  async updateSeed(id: number, seed: Partial<Seed>) {
    const response = await axios.put(`${API_BASE_URL}/seeds/${id}`, seed);
    return response.data;
  },

  // Delete a seed
  async deleteSeed(id: number) {
    await axios.delete(`${API_BASE_URL}/seeds/${id}`);
  },

  async login(username: string, password: string): Promise<User> {
    const response = await axios.post<User>(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });
    return response.data;
  },
};
