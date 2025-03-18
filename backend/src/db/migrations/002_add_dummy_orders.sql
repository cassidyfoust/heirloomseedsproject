-- Insert dummy orders
INSERT INTO orders (customer_name, customer_email, customer_address, is_complete)
VALUES
    ('John Smith', 'john@example.com', '123 Main St, Anytown, USA', true),
    ('Jane Doe', 'jane@example.com', '456 Oak Ave, Somewhere, USA', false),
    ('Bob Wilson', 'bob@example.com', '789 Pine Rd, Elsewhere, USA', true);

-- Insert corresponding orders_seeds entries
INSERT INTO orders_seeds (order_id, seed_id, quantity)
VALUES
    -- John's order
    (1, 1, 2),  -- 2 Brandywine Tomatoes
    (1, 2, 1),  -- 1 Kentucky Wonder Bean
    -- Jane's order
    (2, 3, 3),  -- 3 Black Krim Tomatoes
    (2, 4, 1),  -- 1 Glass Gem Corn
    -- Bob's order
    (3, 5, 2),  -- 2 Scarlet Runner Beans
    (3, 6, 1);  -- 1 Cherokee Purple Tomato 