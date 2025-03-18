-- Insert test orders
INSERT INTO orders (customer_name, customer_email, customer_address, is_complete)
VALUES 
    ('John Doe', 'john@example.com', '123 Main St, Anytown, USA', true),
    ('Jane Smith', 'jane@example.com', '456 Oak Ave, Somewhere, USA', false),
    ('Bob Wilson', 'bob@example.com', '789 Pine Rd, Elsewhere, USA', true);

-- Insert test orders_seeds entries
-- Note: These seed_ids should match existing seeds in your database
INSERT INTO orders_seeds (order_id, seed_id, quantity)
VALUES 
    (1, 1, 2),  -- Order 1: 2 packets of first seed
    (1, 2, 1),  -- Order 1: 1 packet of second seed
    (2, 3, 3),  -- Order 2: 3 packets of third seed
    (2, 4, 2),  -- Order 2: 2 packets of fourth seed
    (3, 5, 1);  -- Order 3: 1 packet of fifth seed 