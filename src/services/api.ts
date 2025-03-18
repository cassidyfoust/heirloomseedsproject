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
  token: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface OrderWithSeeds extends Order {
  seeds: Array<{
    seed: {
      id: number;
      name: string;
      description: string;
      category: string;
    };
    quantity: number;
  }>;
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
    try {
      console.log("Attempting login...");
      const response = await axios.post<User>(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      console.log("Login response:", response.data);

      if (!response.data.token) {
        console.error("No token in login response");
        throw new Error("Invalid login response: missing token");
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Order-related methods
  async getOrders(): Promise<Order[]> {
    try {
      console.log("Fetching orders from API...");
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }
      const response = await axios.get<Order[]>(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Successfully fetched ${response.data.length} orders`);
      return response.data;
    } catch (error: any) {
      console.error("Error in getOrders:", error);
      if (error.response) {
        console.error("API error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
        throw new Error(error.response.data?.error || "Failed to fetch orders");
      }
      throw error;
    }
  },

  async getOrderById(id: number): Promise<OrderWithSeeds> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await axios.get<OrderWithSeeds>(
      `${API_BASE_URL}/orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  async updateOrderStatus(id: number, is_complete: boolean): Promise<Order> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await axios.patch<Order>(
      `${API_BASE_URL}/orders/${id}/status`,
      { is_complete },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
