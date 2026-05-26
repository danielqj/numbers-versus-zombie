PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    joined_at TEXT NOT NULL
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO categories (id, name) VALUES
    (1, 'Books'),
    (2, 'Kitchen'),
    (3, 'Games'),
    (4, 'Stationery'),
    (5, 'Electronics');

INSERT INTO customers (id, first_name, last_name, email, city, joined_at) VALUES
    (1, 'Maya', 'Cole', 'maya.cole@example.com', 'Denver', '2025-01-17'),
    (2, 'Theo', 'Bennett', 'theo.bennett@example.com', 'Austin', '2025-02-04'),
    (3, 'Nora', 'Singh', 'nora.singh@example.com', 'Seattle', '2025-02-28'),
    (4, 'Eli', 'Wright', 'eli.wright@example.com', 'Madison', '2025-03-12'),
    (5, 'Iris', 'Morgan', 'iris.morgan@example.com', 'Phoenix', '2025-04-09'),
    (6, 'Jonah', 'Reed', 'jonah.reed@example.com', 'Portland', '2025-04-21'),
    (7, 'Lena', 'Park', 'lena.park@example.com', 'Chicago', '2025-05-03'),
    (8, 'Owen', 'Hayes', 'owen.hayes@example.com', 'Boston', '2025-06-15');

INSERT INTO products (id, category_id, name, price, stock) VALUES
    (1, 1, 'Mystery Paperback', 12.99, 44),
    (2, 1, 'Cookbook Almanac', 24.50, 18),
    (3, 2, 'Copper Measuring Cups', 19.95, 31),
    (4, 2, 'Ceramic Mixing Bowl', 32.00, 11),
    (5, 3, 'Strategy Card Game', 27.75, 22),
    (6, 3, 'Mini Dice Set', 8.25, 90),
    (7, 4, 'Dot Grid Notebook', 14.20, 63),
    (8, 4, 'Archive Ink Pens', 11.40, 57),
    (9, 5, 'Bluetooth Speaker', 46.80, 15),
    (10, 5, 'USB-C Travel Hub', 39.99, 24);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
    (1, 3, '2026-01-08', 'paid'),
    (2, 1, '2026-01-19', 'shipped'),
    (3, 5, '2026-02-02', 'pending'),
    (4, 2, '2026-02-14', 'paid'),
    (5, 8, '2026-03-01', 'cancelled'),
    (6, 4, '2026-03-18', 'shipped'),
    (7, 7, '2026-04-04', 'paid'),
    (8, 6, '2026-04-22', 'pending'),
    (9, 3, '2026-04-30', 'shipped'),
    (10, 1, '2026-05-03', 'paid');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 7, 2, 14.20),
    (2, 1, 8, 1, 11.40),
    (3, 2, 1, 1, 12.99),
    (4, 2, 6, 4, 8.25),
    (5, 3, 9, 1, 46.80),
    (6, 4, 3, 2, 19.95),
    (7, 4, 2, 1, 24.50),
    (8, 5, 10, 1, 39.99),
    (9, 6, 4, 1, 32.00),
    (10, 6, 5, 1, 27.75),
    (11, 7, 6, 3, 8.25),
    (12, 7, 7, 1, 14.20),
    (13, 8, 8, 2, 11.40),
    (14, 9, 1, 2, 12.99),
    (15, 9, 3, 1, 19.95),
    (16, 10, 5, 1, 27.75),
    (17, 10, 10, 1, 39.99);

CREATE VIEW order_totals AS
SELECT
    o.id AS order_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    o.order_date,
    o.status,
    ROUND(SUM(oi.quantity * oi.unit_price), 2) AS total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.id, o.order_date, o.status;
