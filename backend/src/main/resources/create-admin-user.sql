-- Quick Admin User Creation Script
-- BCrypt hash for password "123456": $2a$10$N9qo8uLOickgx2ZMRZoMye.IcQrQDqhJE3aFNmVnRxlWvlp4ykI6W

-- First, let's check if the database and tables exist
USE pharmacy_1db;

-- Show current users (if any)
SELECT * FROM users WHERE username = 'admin';

-- Delete existing admin user if it exists
DELETE FROM users WHERE username = 'admin';

-- Insert new admin user with correct BCrypt hash for "123456"
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IcQrQDqhJE3aFNmVnRxlWvlp4ykI6W', 'admin@pharmacy.com', 'ADMIN');

-- Verify the user was created
SELECT id, username, email, role, created_at FROM users WHERE username = 'admin';

-- Also create a test customer user
INSERT INTO users (username, password, email, role) VALUES 
('customer', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IcQrQDqhJE3aFNmVnRxlWvlp4ykI6W', 'customer@test.com', 'CUSTOMER');

-- Show all users
SELECT id, username, email, role, created_at FROM users;