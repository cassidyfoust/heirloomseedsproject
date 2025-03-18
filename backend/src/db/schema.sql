-- Create the seeds table
CREATE TABLE IF NOT EXISTS seeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    growing_season VARCHAR(100),
    days_to_maturity INTEGER,
    planting_depth DECIMAL(5,2),
    spacing_inches INTEGER,
    quantity_available INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the category for faster filtering
CREATE INDEX IF NOT EXISTS idx_seeds_category ON seeds(category);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_seeds_updated_at
    BEFORE UPDATE ON seeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO seeds (name, description, category, growing_season, days_to_maturity, planting_depth, spacing_inches, quantity_available)
VALUES
    ('Brandywine Tomato', 'A classic heirloom tomato variety known for its rich, complex flavor.', 'Tomatoes', 'Summer', 80, 0.25, 36, 50),
    ('Kentucky Wonder Bean', 'Traditional pole bean variety with excellent flavor and productivity.', 'Beans', 'Summer', 65, 1.0, 6, 75),
    ('Black Krim Tomato', 'Russian heirloom tomato with distinctive dark color and rich flavor.', 'Tomatoes', 'Summer', 75, 0.25, 36, 30),
    ('Glass Gem Corn', 'Stunning rainbow-colored corn with translucent kernels that look like glass beads.', 'Corn', 'Summer', 110, 1.0, 12, 25),
    ('Scarlet Runner Bean', 'Beautiful red-flowering bean variety that''s both ornamental and edible.', 'Beans', 'Summer', 70, 1.0, 6, 60),
    ('Cherokee Purple Tomato', 'A classic heirloom tomato with deep purple-red color and rich, complex flavor.', 'Tomatoes', 'Summer', 80, 0.25, 36, 0);

-- Insert test user (password is 'heirloomseedstest')
INSERT INTO users (username, password_hash)
VALUES ('heirloomseeds', '$2b$10$YourHashedPasswordHere'); 