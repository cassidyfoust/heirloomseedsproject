import pool from "../config/db";

async function verifyDatabase() {
  const client = await pool.connect();
  try {
    // Check if orders table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
      );
    `);
    console.log("Orders table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Check orders table structure
      const tableStructure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'orders';
      `);
      console.log("\nOrders table structure:");
      tableStructure.rows.forEach((row) => {
        console.log(`${row.column_name}: ${row.data_type}`);
      });

      // Check number of orders
      const orderCount = await client.query(`
        SELECT COUNT(*) FROM orders;
      `);
      console.log("\nNumber of orders:", orderCount.rows[0].count);

      // Check orders_seeds table
      const ordersSeedsCount = await client.query(`
        SELECT COUNT(*) FROM orders_seeds;
      `);
      console.log(
        "Number of orders_seeds entries:",
        ordersSeedsCount.rows[0].count
      );

      // Check if there are any orders with their seeds
      const ordersWithSeeds = await client.query(`
        SELECT o.id, o.customer_name, COUNT(os.seed_id) as seed_count
        FROM orders o
        LEFT JOIN orders_seeds os ON o.id = os.order_id
        GROUP BY o.id, o.customer_name;
      `);
      console.log("\nOrders with their seed counts:");
      ordersWithSeeds.rows.forEach((row) => {
        console.log(
          `Order ${row.id} (${row.customer_name}): ${row.seed_count} seeds`
        );
      });
    }
  } catch (error) {
    console.error("Error verifying database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDatabase();
