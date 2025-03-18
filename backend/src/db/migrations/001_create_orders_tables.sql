-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the orders_seeds join table
CREATE TABLE IF NOT EXISTS orders_seeds (
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    seed_id INTEGER REFERENCES seeds(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, seed_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_seeds_order_id ON orders_seeds(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_seeds_seed_id ON orders_seeds(seed_id); 