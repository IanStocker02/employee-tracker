import inquirer from 'inquirer';
import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function mainMenu() {
  const choices: string[] = [
    'View all departments',
    'View all roles',
    'View all employees',
    'Add a department',
    'Add a role',
    'Add an employee',
    'Update an employee role',
    'Delete a department',
    'Delete a role',
    'Delete an employee',
    'Exit',
  ];

  const { action }: { action: string } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices,
    },
  ]);

  switch (action) {
    case 'View all departments':
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    case 'Delete a department':
      await deleteDepartment();
      break;
    case 'Delete a role':
      await deleteRole();
      break;
    case 'Delete an employee':
      await deleteEmployee();
      break;
    case 'Exit':
      await db.end();
      console.log('Goodbye!');
      return;
  }
  mainMenu();
}

// Function to view all departments
async function viewDepartments() {
  const { rows }: { rows: { id: number; name: string }[] } = await db.query('SELECT * FROM department');
  console.table(rows);
}

// Function to view all roles
async function viewRoles() {
  const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id
  `;
  const { rows }: { rows: { id: number; title: string; salary: number; department: string }[] } = await db.query(query);
  console.table(rows);
}

// Function to view all employees
async function viewEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department,
           role.salary AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `;
  const { rows } = await db.query(query);
  console.table(rows);
}

async function resetDepartmentIdSequence() {
  await db.query(`
    SELECT setval('department_id_seq', (SELECT MAX(id) FROM department));
  `);
  console.log('Department ID sequence reset.');
}

async function resetRoleIdSequence() {
    await db.query(`
      SELECT setval('role_id_seq', (SELECT MAX(id) FROM role));
    `);
    console.log('Role ID sequence reset.');
}

async function resetEmployeeIdSequence() {
  await db.query(`
    SELECT setval('employee_id_seq', (SELECT MAX(id) FROM employee));
  `);
  console.log('Employee ID sequence reset.');
}

// Function to add a department
async function addDepartment() {
  await resetDepartmentIdSequence();

  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the department name:',
  });

  await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added department: ${name}`);
}
// Function to add a role
async function addRole() {
    // Reset the role ID sequence before adding a new role
    await resetRoleIdSequence();
  
    const { rows: departments }: { rows: { id: number; name: string }[] } = await db.query('SELECT * FROM department');
    const { title, salary, department_id } = await inquirer.prompt([
      { type: 'input', name: 'title', message: 'Enter the role title:' },
      { type: 'input', name: 'salary', message: 'Enter the role salary:' },
      {
        type: 'list',
        name: 'department_id',
        message: 'Choose a department:',
        choices: departments.map((dept) => ({ name: dept.name, value: dept.id })),
      },
    ]);
  
    // Insert without specifying the id column
    await db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
    console.log(`Added role: ${title}`);
}
  
// Function to add an employee
async function addEmployee() {
  await resetEmployeeIdSequence();

  const { rows: roles } = await db.query('SELECT * FROM role');
  const { rows: employees } = await db.query('SELECT * FROM employee');
  const { firstName, lastName, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'firstName', message: 'Enter the employee’s first name:' },
    { type: 'input', name: 'lastName', message: 'Enter the employee’s last name:' },
    {
      type: 'list',
      name: 'role_id',
      message: 'Choose a role:',
      choices: roles.map((role) => ({ name: role.title, value: role.id })),
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Choose a manager (or none):',
      choices: employees
        .map((emp) => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
        .concat([{ name: 'None', value: null }]),
    },
  ]);

  await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, role_id, manager_id]);
  console.log(`Added employee: ${firstName} ${lastName}`);
}

// Function to update an employee role
async function updateEmployeeRole() {
  const { rows: employees }: { rows: { id: number; first_name: string; last_name: string }[] } = await db.query('SELECT * FROM employee');
  const { rows: roles }: { rows: { id: number; title: string }[] } = await db.query('SELECT * FROM role');
  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Choose an employee to update:',
      choices: employees.map((emp) => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })),
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Choose a new role:',
      choices: roles.map((role) => ({ name: role.title, value: role.id })),
    },
  ]);

  await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
  console.log('Employee role updated!');
}

// Function to delete a department
async function deleteDepartment() {
  const { rows: departments }: { rows: { id: number; name: string }[] } = await db.query('SELECT * FROM department');
  if (departments.length === 0) {
    console.log('No departments available to delete.');
    return;
  }

  const { department_id }: { department_id: number } = await inquirer.prompt({
    type: 'list',
    name: 'department_id',
    message: 'Choose a department to delete:',
    choices: departments.map((dept) => ({
      name: dept.name,
      value: dept.id,
    })),
  });

  await db.query('DELETE FROM department WHERE id = $1', [department_id]);
  console.log('Department deleted!');
}

// Function to delete a role
async function deleteRole() {
  const { rows: roles }: { rows: { id: number; title: string }[] } = await db.query('SELECT * FROM role');
  if (roles.length === 0) {
    console.log('No roles available to delete.');
    return;
  }

  const { role_id }: { role_id: number } = await inquirer.prompt({
    type: 'list',
    name: 'role_id',
    message: 'Choose a role to delete:',
    choices: roles.map((role) => ({
      name: role.title,
      value: role.id,
    })),
  });

  await db.query('DELETE FROM role WHERE id = $1', [role_id]);
  console.log('Role deleted!');
}

// Function to delete an employee
async function deleteEmployee() {
  const { rows: employees }: { rows: { id: number; first_name: string; last_name: string }[] } = await db.query('SELECT * FROM employee');
  if (employees.length === 0) {
    console.log('No employees available to delete.');
    return;
  }

  const { employee_id }: { employee_id: number } = await inquirer.prompt({
    type: 'list',
    name: 'employee_id',
    message: 'Choose an employee to delete:',
    choices: employees.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    })),
  });

  await db.query('DELETE FROM employee WHERE id = $1', [employee_id]);
  console.log('Employee deleted!');
}

mainMenu();