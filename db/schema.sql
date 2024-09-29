-- Drop existing tables if they exist
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;

-- Create department table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create role table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    salary NUMERIC NOT NULL,
    department_id INTEGER REFERENCES department(id)
);

-- Create employee table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES role(id),
    manager_id INTEGER REFERENCES employee(id)
);