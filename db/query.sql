/* View all Roles */

SELECT 
role.id AS role_id,
role.title, 
role.salary,
department.department_name
FROM role
JOIN department 
ON role.department_id = department.id;

/* View all employees */

SELECT 
a.id AS employee_id,
a.first_name,
a.last_name, 
c.title,
d.department_name,
c.salary,
b.first_name AS manager_firstname,
b.last_name AS manager_lastname
FROM employee a
LEFT JOIN employee b ON a.manager_id = b.id
INNER JOIN role c ON a.role_id = c.id
INNER JOIN department d ON d.id = c.department_id;

/* View employees by manager */

SELECT 
b.first_name AS manager_firstname,
b.last_name AS manager_lastname,
a.id AS employee_id,
a.first_name,
a.last_name, 
c.title,
d.department_name,
c.salary
FROM employee a
LEFT JOIN employee b ON a.manager_id = b.id
INNER JOIN role c ON a.role_id = c.id
INNER JOIN department d ON d.id = c.department_id
WHERE b.first_name = "John" AND b.last_name = "Doe";

/* get manager names*/

SELECT 
concat(b.first_name, " ", b.last_name) AS manager_name
FROM employee a
LEFT JOIN employee b ON a.manager_id = b.id
INNER JOIN role c ON a.role_id = c.id
INNER JOIN department d ON d.id = c.department_id
WHERE b.first_name IS NOT NULL AND b.last_name IS NOT NULL;

/* View employees by department */

SELECT 
a.id AS employee_id,
a.first_name,
a.last_name, 
c.title,
d.department_name,
c.salary,
b.first_name AS manager_firstname,
b.last_name AS manager_lastname
FROM employee a
LEFT JOIN employee b ON a.manager_id = b.id
INNER JOIN role c ON a.role_id = c.id
INNER JOIN department d ON d.id = c.department_id
WHERE d.department_name = "Sales";

/* Add department */

INSERT INTO department (department_name)
VALUES ("Talent");

/* Add a role */

INSERT INTO role (role_title, salary, department_id)
VALUES ("Talent Executive", 75000, 5);

/* Add an employee */

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Sarah", "Lam", 4, 3);

/* Update an employee role */

UPDATE employee SET role_id = 1
WHERE employee.first_name = "Mike" AND employee.last_name = "Chan";

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Jennifer", "Sam", (SELECT id FROM (SELECT r.id FROM role r WHERE r.title = "Sales Associate") sub), (SELECT id FROM (SELECT e.id FROM employee e WHERE e.first_name = "John" AND e.last_name = "Doe") sub));

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Anna", "Lu", (SELECT r.id FROM role r WHERE r.title = "Sales Lead"), (SELECT e.id FROM employee e WHERE e.first_name = "Ashley" AND e.last_name = "Rodriguez"));

UPDATE employee SET manager_id = (SELECT a.id FROM (SELECT b.id FROM employee b WHERE b.first_name = "Jennifer" AND b.last_name = "Sam") a) WHERE first_name = "Tom" AND last_name = "Allen";

/* DELETING SPECIFIC VALUES */

DELETE FROM department WHERE department_name = "Legal";