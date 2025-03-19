import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface Seed {
  id: number;
  name: string;
  description: string;
  category: string;
  days_to_maturity: number;
  is_oversized: boolean;
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

export type OrderStatus = "incomplete" | "in_progress" | "complete";

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  donation_amount: number;
  seeds: Array<{
    seed: {
      id: number;
      name: string;
      category: string;
    };
    quantity: number;
  }>;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  email?: string;
  status?: string;
  seedName?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SeedQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: "name" | "category";
  sortOrder?: "asc" | "desc";
  showOutOfStock?: boolean;
  showOversized?: boolean;
}

export const api = {
  // Get all seeds with optional filtering and pagination
  async getSeeds(
    params: SeedQueryParams = {}
  ): Promise<PaginatedResponse<Seed>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.showOutOfStock) queryParams.append("showOutOfStock", "true");
    if (params.showOversized) queryParams.append("showOversized", "true");

    const response = await axiosInstance.get<PaginatedResponse<Seed>>(
      `/seeds?${queryParams}`
    );
    return response.data;
  },

  // Get all categories
  async getCategories() {
    const response = await axiosInstance.get("/seeds/categories");
    return response.data;
  },

  // Get a single seed by ID
  async getSeedById(id: number) {
    const response = await axiosInstance.get(`/seeds/${id}`);
    return response.data;
  },

  // Create a new seed
  async createSeed(seed: Omit<Seed, "id" | "created_at" | "updated_at">) {
    const response = await axiosInstance.post("/seeds", seed);
    return response.data;
  },

  // Update a seed
  async updateSeed(id: number, seed: Partial<Seed>) {
    const response = await axiosInstance.put(`/seeds/${id}`, seed);
    return response.data;
  },

  // Delete a seed
  async deleteSeed(id: number) {
    await axiosInstance.delete(`/seeds/${id}`);
  },

  async login(username: string, password: string): Promise<User> {
    try {
      console.log("Attempting login...");
      const response = await axiosInstance.post<User>("/auth/login", {
        username,
        password,
      });
      console.log("Login response received:", {
        ...response.data,
        token: response.data.token ? "[PRESENT]" : "[MISSING]",
      });

      if (!response.data.token) {
        console.error("No token in login response");
        throw new Error("Invalid login response: missing token");
      }

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Order-related methods
  async createOrder(orderData: {
    customer_name: string;
    customer_email: string;
    customer_address: string;
    seeds: Array<{ seed_id: number; quantity: number }>;
    include_donation: boolean;
    donation_amount: number;
  }): Promise<Order> {
    try {
      console.log("Creating order:", orderData);
      const response = await axiosInstance.post<Order>("/orders", orderData);
      console.log("Order created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.response) {
        console.error("API error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
        throw new Error(error.response.data?.error || "Failed to create order");
      }
      throw error;
    }
  },

  async getOrders(
    params?: OrderQueryParams
  ): Promise<PaginatedResponse<Order>> {
    try {
      console.log("Fetching orders from API...");
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.email) queryParams.append("email", params.email);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.seedName) queryParams.append("seedName", params.seedName);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const response = await axiosInstance.get<PaginatedResponse<Order>>(
        `/orders?${queryParams}`
      );

      // Transform response to match PaginatedResponse format if needed
      const data = Array.isArray(response.data)
        ? {
            items: response.data,
            total: response.data.length,
            page: params?.page || 1,
            limit: params?.limit || 10,
            totalPages: Math.ceil(response.data.length / (params?.limit || 10)),
          }
        : response.data;

      console.log("Response data:", data);
      console.log(`Successfully fetched ${data.items.length} orders`);
      return data;
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

  async getOrderById(id: number): Promise<Order> {
    const response = await axiosInstance.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await axiosInstance.patch<Order>(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};
