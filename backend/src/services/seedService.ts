import pool from "../config/db";

export interface Seed {
  id: string;
  name: string;
  description: string;
  category: string;
  growing_season: string;
  days_to_maturity: number;
  planting_depth: number;
  spacing_inches: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const seedService = {
  // Get all seeds with optional filtering, sorting, and pagination
  async getAllSeeds(
    category?: string,
    searchQuery?: string,
    sortBy: "name" | "category" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 9
  ): Promise<PaginatedResponse<Seed>> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const conditions: string[] = [];

    // Build the WHERE clause
    if (category) {
      conditions.push("category = $1");
      params.push(category);
    }

    if (searchQuery) {
      conditions.push(
        "(name ILIKE $" +
          (params.length + 1) +
          " OR description ILIKE $" +
          (params.length + 1) +
          ")"
      );
      params.push(`%${searchQuery}%`);
    }

    const whereClause =
      conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM seeds${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const result = await pool.query(
      `SELECT * FROM seeds${whereClause} ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${
        params.length + 1
      } OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return {
      items: result.rows,
      total,
      page,
      limit,
      totalPages,
    };
  },

  // Get a single seed by ID
  async getSeedById(id: string): Promise<Seed | null> {
    const result = await pool.query("SELECT * FROM seeds WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  // Get all unique categories
  async getCategories(): Promise<string[]> {
    const result = await pool.query(
      "SELECT DISTINCT category FROM seeds ORDER BY category"
    );
    return result.rows.map((row: { category: string }) => row.category);
  },

  // Create a new seed
  async createSeed(
    seed: Omit<Seed, "id" | "created_at" | "updated_at">
  ): Promise<Seed> {
    const result = await pool.query(
      `INSERT INTO seeds (name, description, category, growing_season, days_to_maturity, planting_depth, spacing_inches)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        seed.name,
        seed.description,
        seed.category,
        seed.growing_season,
        seed.days_to_maturity,
        seed.planting_depth,
        seed.spacing_inches,
      ]
    );
    return result.rows[0];
  },

  // Update a seed
  async updateSeed(
    id: string,
    seed: Partial<Omit<Seed, "id" | "created_at" | "updated_at">>
  ): Promise<Seed | null> {
    const setClause = Object.keys(seed)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE seeds SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(seed)]
    );
    return result.rows[0] || null;
  },

  // Delete a seed
  async deleteSeed(id: string): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM seeds WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },
};
