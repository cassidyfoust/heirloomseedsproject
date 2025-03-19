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
  status: "incomplete" | "in_progress" | "complete";
  created_at: Date;
  updated_at: Date;
  donation_amount: number;
}

export interface OrderWithSeeds extends Order {
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

interface OrderSeed {
  seed_id: number;
  quantity: number;
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
      const result = await client.query(`
        SELECT o.*, 
          json_agg(
            json_build_object(
              'seed', json_build_object(
                'id', s.id,
                'name', s.name,
                'category', s.category
              ),
              'quantity', os.quantity
            )
          ) as seeds
        FROM orders o
        LEFT JOIN orders_seeds os ON o.id = os.order_id
        LEFT JOIN seeds s ON os.seed_id = s.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
      console.log(`Successfully fetched ${result.rows.length} orders`);
      return result.rows.map((row) => ({
        ...row,
        seeds: row.seeds || [],
      }));
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

  async getOrderById(id: number): Promise<OrderWithSeeds | null> {
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
        `SELECT os.quantity, s.id, s.name, s.description, s.category
         FROM orders_seeds os
         JOIN seeds s ON os.seed_id = s.id
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
    seeds: OrderSeed[],
    includeDonation: boolean = false,
    donationAmount: number = 0
  ): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Create the order
      const orderResult = await client.query(
        `INSERT INTO orders (customer_name, customer_email, customer_address, status, donation_amount)
         VALUES ($1, $2, $3, 'incomplete', $4)
         RETURNING *`,
        [
          customerName,
          customerEmail,
          customerAddress,
          includeDonation ? donationAmount : 0,
        ]
      );
      const order = orderResult.rows[0];

      // Create order_seeds entries and update seed quantities
      for (const seed of seeds) {
        // Check if enough seeds are available
        const seedResult = await client.query(
          "SELECT quantity_available FROM seeds WHERE id = $1",
          [seed.seed_id]
        );
        const currentQuantity = seedResult.rows[0].quantity_available;

        if (currentQuantity < seed.quantity) {
          throw new Error(
            `Not enough seeds available for seed ID ${seed.seed_id}`
          );
        }

        // Create order_seeds entry
        await client.query(
          `INSERT INTO orders_seeds (order_id, seed_id, quantity)
           VALUES ($1, $2, $3)`,
          [order.id, seed.seed_id, seed.quantity]
        );

        // Update seed quantity
        await client.query(
          `UPDATE seeds 
           SET quantity_available = quantity_available - $1
           WHERE id = $2`,
          [seed.quantity, seed.seed_id]
        );
      }

      await client.query("COMMIT");
      return order;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(
    id: number,
    status: "incomplete" | "in_progress" | "complete"
  ): Promise<Order> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE orders 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, id]
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
