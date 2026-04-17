CREATE DATABASE servicehub_db;

USE servicehub_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    status ENUM('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

SHOW TABLES;

USE servicehub_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    status ENUM('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

SHOW TABLES;

USE servicehub_db;

INSERT INTO services (service_name, description, price, category)
VALUES
('House Cleaning', 'General home cleaning service', 1500.00, 'Cleaning'),
('Plumbing Repair', 'Fix pipes, leaks, and faucets', 1200.00, 'Repair'),
('Electrical Repair', 'Wiring and electrical maintenance', 1800.00, 'Repair'),
('Aircon Maintenance', 'Cleaning and maintenance of air conditioning unit', 2000.00, 'Maintenance');

SELECT * FROM services;

USE servicehub_db;

INSERT INTO users (full_name, email, password, role)
VALUES ('Admin User', 'admin@servicehub.com', '$2b$10$wH6K0m3R4Q6i4b5xQmQhOu3Y4v6m1Yj1W6lUQ5/0A1Kq3Dq4mA5b2', 'admin');

USE servicehub_db;

UPDATE users
SET role = 'admin'
WHERE email = 'admin2@servicehub.com';

SELECT id, full_name, email, role
FROM users
WHERE email = 'admin2@servicehub.com';

USE servicehub_db;

SELECT id, full_name, email, role
FROM users;

USE servicehub_db;

UPDATE users
SET role = 'admin'
WHERE email = 'admin3@servicehub.com';

USE servicehub_db;

INSERT INTO services (service_name, description, price, category)
VALUES
('Window Cleaning', 'Interior and exterior window cleaning for homes', 1800.00, 'Cleaning'),
('Furniture Assembly', 'Assembly of shelves, tables, cabinets, and other home furniture', 1600.00, 'Installation'),
('Appliance Repair', 'Basic troubleshooting and repair for household appliances', 2800.00, 'Repair');

SELECT id, service_name, category, price
FROM services;

USE servicehub_db;

SELECT id, full_name, email, role
FROM users
WHERE role = 'admin';

ALTER TABLE users
  MODIFY role ENUM('customer','worker','admin','super_admin') NOT NULL DEFAULT 'customer',
  ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved' AFTER role,
  ADD COLUMN approval_notes TEXT NULL AFTER approval_status,
  ADD COLUMN credentials_summary TEXT NULL AFTER approval_notes,
  ADD COLUMN document_links TEXT NULL AFTER credentials_summary,
  ADD COLUMN approved_by INT NULL AFTER document_links,
  ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

ALTER TABLE users
  ADD CONSTRAINT fk_users_approved_by
  FOREIGN KEY (approved_by) REFERENCES users(id)
  ON DELETE SET NULL;

ALTER TABLE services
  ADD COLUMN image_url TEXT NULL AFTER category,
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER image_url;