import { Pool } from "pg";
import pool from "../config/db";
import { Seed } from "./seedService";

// Custom error classes
export class OrderNotFoundError extends Error {
  constructor(orderId: number) {
    super(`Order with ID ${orderId} not found`);
    this.name = "OrderNotFoundError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = "DatabaseError";
    this.originalError = originalError;
  }
  originalError?: any;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  is_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrderWithSeeds extends Order {
  seeds: Array<{
    seed: Seed;
    quantity: number;
  }>;
}

class OrderService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getAllOrders(): Promise<Order[]> {
    const client = await this.pool.connect();
    try {
      console.log("Attempting to fetch all orders...");
      const result = await client.query(
        "SELECT * FROM orders ORDER BY created_at DESC"
      );
      console.log(`Successfully fetched ${result.rows.length} orders`);
      return result.rows;
    } catch (error) {
      console.error("Database error in getAllOrders:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      throw new DatabaseError(
        "Failed to fetch orders",
        error instanceof Error ? error : undefined
      );
    } finally {
      client.release();
    }
  }

  async getOrderById(id: number): Promise<OrderWithSeeds> {
    const client = await this.pool.connect();
    try {
      // Start a transaction
      await client.query("BEGIN");

      // Get order details
      const orderResult = await client.query(
        "SELECT * FROM orders WHERE id = $1",
        [id]
      );

      if (orderResult.rows.length === 0) {
        throw new OrderNotFoundError(id);
      }

      // Get seeds for this order
      const seedsResult = await client.query(
        `SELECT s.*, os.quantity 
         FROM seeds s 
         JOIN orders_seeds os ON s.id = os.seed_id 
         WHERE os.order_id = $1`,
        [id]
      );

      // Commit the transaction
      await client.query("COMMIT");

      return {
        ...orderResult.rows[0],
        seeds: seedsResult.rows.map((row) => ({
          seed: {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            growing_season: row.growing_season,
            days_to_maturity: row.days_to_maturity,
            planting_depth: row.planting_depth,
            spacing_inches: row.spacing_inches,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
          quantity: row.quantity,
        })),
      };
    } catch (error) {
      // Rollback the transaction on error
      await client.query("ROLLBACK");

      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        "Failed to fetch order details",
        error instanceof Error ? error : undefined
      );
    } finally {
      client.release();
    }
  }

  async createOrder(
    customerName: string,
    customerEmail: string,
    customerAddress: string,
    seeds: Array<{ seedId: number; quantity: number }>
  ): Promise<OrderWithSeeds> {
    // Validate input
    if (!customerName || !customerEmail || !customerAddress) {
      throw new ValidationError("Missing required customer information");
    }
    if (!seeds.length) {
      throw new ValidationError("Order must contain at least one seed");
    }

    const client = await this.pool.connect();
    try {
      // Start a transaction
      await client.query("BEGIN");

      // Create the order
      const orderResult = await client.query(
        `INSERT INTO orders (customer_name, customer_email, customer_address, is_complete)
         VALUES ($1, $2, $3, false)
         RETURNING *`,
        [customerName, customerEmail, customerAddress]
      );

      const order = orderResult.rows[0];

      // Add seeds to the order
      for (const { seedId, quantity } of seeds) {
        // Verify seed exists and has sufficient quantity
        const seedResult = await client.query(
          "SELECT quantity_available FROM seeds WHERE id = $1",
          [seedId]
        );

        if (seedResult.rows.length === 0) {
          throw new ValidationError(`Seed with ID ${seedId} not found`);
        }

        if (seedResult.rows[0].quantity_available < quantity) {
          throw new ValidationError(
            `Insufficient quantity available for seed ID ${seedId}`
          );
        }

        // Add to orders_seeds
        await client.query(
          "INSERT INTO orders_seeds (order_id, seed_id, quantity) VALUES ($1, $2, $3)",
          [order.id, seedId, quantity]
        );

        // Update seed quantity
        await client.query(
          "UPDATE seeds SET quantity_available = quantity_available - $1 WHERE id = $2",
          [quantity, seedId]
        );
      }

      // Commit the transaction
      await client.query("COMMIT");

      // Fetch the complete order with seeds
      return this.getOrderById(order.id);
    } catch (error) {
      // Rollback the transaction on error
      await client.query("ROLLBACK");

      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        "Failed to create order",
        error instanceof Error ? error : undefined
      );
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(id: number, isComplete: boolean): Promise<Order> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "UPDATE orders SET is_complete = $1 WHERE id = $2 RETURNING *",
        [isComplete, id]
      );

      if (result.rows.length === 0) {
        throw new OrderNotFoundError(id);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        "Failed to update order status",
        error instanceof Error ? error : undefined
      );
    } finally {
      client.release();
    }
  }
}

export const orderService = new OrderService(pool);
