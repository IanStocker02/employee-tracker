-- Insert departments
INSERT INTO department (id, name) 
VALUES
(1, 'Research'),
(2, 'Development'),
(3, 'Operations'),
(4, 'Logistics'),
(5, 'Customer Service'),
(6, 'Legal'),
(7, 'Administration')
ON CONFLICT (id) DO NOTHING;

-- Insert roles
INSERT INTO role (id, title, salary, department_id) 
VALUES
(1, 'Research Scientist', 95000.00, 1),
(2, 'Product Developer', 85000.00, 2),
(3, 'Operations Manager', 75000.00, 3),
(4, 'Logistics Coordinator', 55000.00, 4),
(5, 'Customer Service Representative', 40000.00, 5),
(6, 'Legal Advisor', 105000.00, 6),
(7, 'Administrative Assistant', 45000.00, 7),
(8, 'Senior Research Scientist', 115000.00, 1),
(9, 'Lead Developer', 95000.00, 2),
(10, 'Operations Director', 95000.00, 3),
(11, 'Logistics Manager', 65000.00, 4),
(12, 'Customer Service Manager', 60000.00, 5),
(13, 'Chief Legal Officer', 150000.00, 6),
(14, 'Office Manager', 70000.00, 7)
ON CONFLICT (id) DO NOTHING;

-- Insert employees (managers first)
INSERT INTO employee (id, first_name, last_name, role_id, manager_id) 
VALUES
(1, 'Alice', 'Johnson', 1, NULL),  -- Manager
(2, 'Bob', 'Smith', 2, NULL),      -- Manager
(9, 'Ivy', 'Martinez', 8, 1),      -- Manager
(10, 'Jack', 'Hernandez', 9, 2),   -- Manager
(12, 'Leo', 'Gonzalez', 11, 4),    -- Manager
(13, 'Mia', 'Wilson', 12, NULL),   -- Manager
(14, 'Nina', 'Anderson', 13, NULL),-- Manager
(15, 'Oscar', 'Thomas', 14, NULL), -- Manager

-- Insert employees (with managers)
(3, 'Charlie', 'Williams', 3, 10),
(4, 'Diana', 'Brown', 3, 10),
(5, 'Eve', 'Jones', 4, NULL),
(16, 'Paul', 'Taylor', 1, 9),
(17, 'Quinn', 'Moore', 2, 10),
(18, 'Rita', 'Jackson', 3, 10),
(19, 'Sam', 'Martin', 4, 12),
(20, 'Tina', 'Lee', 5, 13),
(21, 'Uma', 'Perez', 6, 14),
(22, 'Victor', 'Thompson', 7, 15),
(23, 'Wendy', 'White', 8, 9)
ON CONFLICT (id) DO NOTHING;