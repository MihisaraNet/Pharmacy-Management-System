-- Sample Data for Pharmacy Database
-- Run this after creating the tables with schema.sql

-- Insert Sample Users
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$YQ0h3qJHGGEp7EKwLQxXH.VJLq1mYE/yQqJ3p8YhWOqL2gWJ3pIfe', 'admin@pharmacy.com', 'ADMIN'),
('john_doe', '$2a$10$YQ0h3qJHGGEp7EKwLQxXH.VJLq1mYE/yQqJ3p8YhWOqL2gWJ3pIfe', 'john@example.com', 'CUSTOMER'),
('jane_smith', '$2a$10$YQ0h3qJHGGEp7EKwLQxXH.VJLq1mYE/yQqJ3p8YhWOqL2gWJ3pIfe', 'jane@example.com', 'CUSTOMER');
-- Note: All passwords are 'password123'

-- Insert Sample Medicines
INSERT INTO medicines (name, price, quantity, expiry_date, category, is_active) VALUES
('Paracetamol 500mg', 5.99, 150, '2026-12-31', 'Pain Relief', TRUE),
('Amoxicillin 250mg', 12.50, 80, '2025-08-15', 'Antibiotic', TRUE),
('Ibuprofen 400mg', 7.25, 200, '2026-03-20', 'Pain Relief', TRUE),
('Cetirizine 10mg', 8.99, 120, '2025-11-10', 'Allergy', TRUE),
('Vitamin C 1000mg', 15.00, 90, '2027-06-30', 'Vitamins', TRUE),
('Aspirin 75mg', 6.50, 175, '2025-09-25', 'Pain Relief', TRUE),
('Omeprazole 20mg', 18.75, 65, '2025-07-18', 'Gastric', TRUE),
('Metformin 500mg', 22.00, 110, '2026-01-12', 'Diabetes', TRUE),
('Losartan 50mg', 25.50, 85, '2025-10-05', 'Blood Pressure', TRUE),
('Atorvastatin 10mg', 28.00, 95, '2026-02-28', 'Cholesterol', TRUE);

-- Insert Medicine Expiry Records (with varying expiry dates for testing)

-- Expired Medicines (already passed expiry date)
INSERT INTO medicine_expiry (medicine_id, batch_number, expiry_date, manufacture_date, quantity, purchase_price, supplier_name, status, notes) VALUES
(2, 'AMX-2024-001', '2024-12-15', '2024-01-15', 25, 10.00, 'MediSupply Ltd', 'EXPIRED', 'Expired - needs disposal'),
(7, 'OMP-2024-002', '2024-11-20', '2023-11-20', 15, 15.00, 'PharmaCorp', 'EXPIRED', 'Expired last month'),
(9, 'LST-2024-003', '2024-10-10', '2023-10-10', 20, 20.00, 'HealthSource Inc', 'EXPIRED', 'Expired - dispose immediately');

-- Near Expiry Medicines (expiring within 7 days from today)
-- Adjust these dates based on current date for testing
INSERT INTO medicine_expiry (medicine_id, batch_number, expiry_date, manufacture_date, quantity, purchase_price, supplier_name, status, notes) VALUES
(4, 'CET-2025-001', DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 365 DAY), 30, 7.00, 'AllergyMed Co', 'ACTIVE', 'Expires in 2 days'),
(6, 'ASP-2025-002', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 365 DAY), 40, 5.00, 'PainRelief Corp', 'ACTIVE', 'Expires in 5 days'),
(9, 'LST-2025-003', DATE_ADD(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 365 DAY), 18, 22.00, 'CardioHealth Ltd', 'ACTIVE', 'Expires in 6 days');

-- Expiring Soon Medicines (expiring within 30 days but more than 7 days)
INSERT INTO medicine_expiry (medicine_id, batch_number, expiry_date, manufacture_date, quantity, purchase_price, supplier_name, status, notes) VALUES
(3, 'IBU-2025-001', DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 365 DAY), 50, 6.00, 'MediSupply Ltd', 'ACTIVE', 'Expires in 15 days'),
(8, 'MET-2025-002', DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 365 DAY), 35, 18.00, 'DiabetesCare Inc', 'ACTIVE', 'Expires in 20 days'),
(10, 'ATO-2025-003', DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 365 DAY), 28, 24.00, 'HeartHealth Co', 'ACTIVE', 'Expires in 25 days');

-- Active Medicines (good expiry dates - more than 30 days)
INSERT INTO medicine_expiry (medicine_id, batch_number, expiry_date, manufacture_date, quantity, purchase_price, supplier_name, status, notes) VALUES
(1, 'PAR-2025-001', DATE_ADD(CURDATE(), INTERVAL 180 DAY), DATE_SUB(CURDATE(), INTERVAL 185 DAY), 100, 4.50, 'MediSupply Ltd', 'ACTIVE', 'Good stock'),
(2, 'AMX-2025-002', DATE_ADD(CURDATE(), INTERVAL 120 DAY), DATE_SUB(CURDATE(), INTERVAL 245 DAY), 60, 10.00, 'PharmaCorp', 'ACTIVE', 'Good condition'),
(3, 'IBU-2025-002', DATE_ADD(CURDATE(), INTERVAL 240 DAY), DATE_SUB(CURDATE(), INTERVAL 125 DAY), 150, 6.00, 'PainRelief Corp', 'ACTIVE', 'New batch'),
(5, 'VIT-2026-001', DATE_ADD(CURDATE(), INTERVAL 365 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 80, 12.00, 'VitaminWorks Ltd', 'ACTIVE', 'Long shelf life'),
(1, 'PAR-2026-002', DATE_ADD(CURDATE(), INTERVAL 450 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), 120, 4.50, 'MediSupply Ltd', 'ACTIVE', 'Fresh stock');

-- Disposed Medicines (for record keeping)
INSERT INTO medicine_expiry (medicine_id, batch_number, expiry_date, manufacture_date, quantity, purchase_price, supplier_name, status, notes) VALUES
(4, 'CET-2024-OLD', '2024-09-01', '2023-09-01', 0, 7.00, 'AllergyMed Co', 'DISPOSED', 'Disposed on 2024-10-15'),
(6, 'ASP-2024-OLD', '2024-08-15', '2023-08-15', 0, 5.00, 'PainRelief Corp', 'DISPOSED', 'Properly disposed');

-- Insert Sample Sales
INSERT INTO sales (user_id, total_amount, sale_date, status) VALUES
(2, 23.99, DATE_SUB(NOW(), INTERVAL 5 DAY), 'COMPLETED'),
(3, 45.50, DATE_SUB(NOW(), INTERVAL 3 DAY), 'COMPLETED'),
(2, 78.25, DATE_SUB(NOW(), INTERVAL 1 DAY), 'PENDING'),
(3, 32.00, NOW(), 'PENDING');

-- Insert Sample Sale Items
INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price) VALUES
-- Sale 1 items
(1, 1, 2, 5.99),
(1, 3, 1, 7.25),
(1, 4, 1, 8.99),
-- Sale 2 items
(2, 2, 2, 12.50),
(2, 6, 3, 6.50),
-- Sale 3 items
(3, 8, 2, 22.00),
(3, 9, 1, 25.50),
(3, 4, 1, 8.99),
-- Sale 4 items
(4, 1, 3, 5.99),
(4, 5, 1, 15.00);

-- Insert Sample Deliveries
INSERT INTO deliveries (sale_id, address, status, delivery_date) VALUES
(1, '123 Main St, Apartment 4B, New York, NY 10001', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, '456 Oak Avenue, Suite 200, Los Angeles, CA 90001', 'SHIPPED', NULL),
(3, '789 Pine Road, House #12, Chicago, IL 60601', 'PENDING', NULL),
(4, '321 Elm Street, Floor 3, Houston, TX 77001', 'PENDING', NULL);

-- Insert Sample Reports
INSERT INTO reports (report_type, generated_date, content) VALUES
('SALES_SUMMARY', DATE_SUB(NOW(), INTERVAL 7 DAY), '{"totalSales": 25, "totalRevenue": 1234.50, "period": "2024-12-01 to 2024-12-07"}'),
('LOW_STOCK', DATE_SUB(NOW(), INTERVAL 3 DAY), '{"medicines": [{"name": "Amoxicillin", "quantity": 5}, {"name": "Omeprazole", "quantity": 8}]}'),
('SALES_SUMMARY', DATE_SUB(NOW(), INTERVAL 1 DAY), '{"totalSales": 15, "totalRevenue": 789.25, "period": "2024-12-08 to 2024-12-14"}');

-- Display summary of inserted data
SELECT 'Data Insertion Complete!' as Status;
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Medicines' FROM medicines;
SELECT COUNT(*) as 'Total Expiry Records' FROM medicine_expiry;
SELECT COUNT(*) as 'Expired Medicines' FROM medicine_expiry WHERE status = 'EXPIRED';
SELECT COUNT(*) as 'Near Expiry (7 days)' FROM medicine_expiry WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status = 'ACTIVE';
SELECT COUNT(*) as 'Total Sales' FROM sales;
SELECT COUNT(*) as 'Total Deliveries' FROM deliveries;
SELECT COUNT(*) as 'Total Reports' FROM reports;
