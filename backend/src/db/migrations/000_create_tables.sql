-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing order_status enum type if it exists
DROP TYPE IF EXISTS order_status CASCADE;

-- Create order_status enum type
CREATE TYPE order_status AS ENUM ('incomplete', 'in_progress', 'complete');

-- Create seeds table if it doesn't exist
CREATE TABLE IF NOT EXISTS seeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    days_to_maturity INTEGER,
    quantity_available INTEGER DEFAULT 0,
    is_oversized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for seeds table if they don't exist
CREATE INDEX IF NOT EXISTS idx_seeds_category ON seeds(category);
CREATE INDEX IF NOT EXISTS idx_seeds_name ON seeds(name);

-- Create trigger for seeds table
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_seeds_updated_at ON seeds;
    CREATE TRIGGER update_seeds_updated_at
        BEFORE UPDATE ON seeds
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    status order_status DEFAULT 'incomplete',
    donation_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders_seeds table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders_seeds (
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    seed_id INTEGER REFERENCES seeds(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, seed_id)
);

-- Create indexes for orders table if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_seeds_order_id ON orders_seeds(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_seeds_seed_id ON orders_seeds(seed_id);

-- Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at

    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
END $$;
