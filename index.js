// Imported required packages
const inquirer = require('inquirer');
const connection = require('./server');
const table = require('console.table');

connection.connect((error) => {
  if (error) throw error;
  console.log("Employee Tracker")
  promptUser();
});

// Questions for user input
const promptUser = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select an option:',
        choices: [
          'View All Employees',
          'View All Roles',
          'View All Departments',
          'View All Employees By Department',
          'View Department Budgets',
          'Update Employee Role',
          'Update Employee Manager',
          'Add Employee',
          'Add Role',
          'Add Department',
          'Remove Employee',
          'Remove Role',
          'Remove Department',
          'Exit'
          ]
      }
    ])
    .then((answers) => {
      const {choices} = answers;

        if (choices === 'View All Employees') {
            viewAllEmployees();
        }

        if (choices === 'View All Departments') {
            viewAllDepartments();
        }

        if (choices === 'View All Employees By Department') {
            viewEmployeesByDepartment();
        }

        if (choices === 'Add Employee') {
            addEmployee();
        }

        if (choices === 'Remove Employee') {
            removeEmployee();
        }

        if (choices === 'Update Employee Role') {
            updateEmployeeRole();
        }

        if (choices === 'Update Employee Manager') {
            updateEmployeeManager();
        }

        if (choices === 'View All Roles') {
            viewAllRoles();
        }

        if (choices === 'Add Role') {
            addRole();
        }

        if (choices === 'Remove Role') {
            removeRole();
        }

        if (choices === 'Add Department') {
            addDepartment();
        }

        if (choices === 'View Department Budgets') {
            viewDepartmentBudget();
        }

        if (choices === 'Remove Department') {
            removeDepartment();
        }

        if (choices === 'Exit') {
            connection.end();
        }
  });
};

// View all Employees
const viewAllEmployees = async () => {
try {
const sql = `SELECT a.id AS employee_id,
            a.first_name AS first_name,
            a.last_name, 
            c.title,
            d.department_name,
            c.salary,
            b.first_name AS manager_firstname,
            b.last_name AS manager_lastname
            FROM employee a
            LEFT JOIN employee b ON a.manager_id = b.id
            INNER JOIN role c ON a.role_id = c.id
            INNER JOIN department d ON d.id = c.department_id;`;
  const [response] = await connection.promise().query(sql);
    console.log('Current Employees:');
    console.table(response);
    promptUser();
  } catch (error) {
    console.error(error);
  };
};

// View all Roles
const viewAllRoles = async () => {
try {
  const sql = `SELECT role.id AS role_id,
            role.title,
            role.salary,
            department.department_name
            FROM role
            JOIN department 
            ON role.department_id = department.id`;
    const [response] = await connection.promise().query(sql);
    console.log('Current Roles:');
    console.table(response);
    promptUser();
    } catch (error) {
      console.error(error);
    }
  };

// View all departments
const viewAllDepartments = async () => {
try {
  const sql = `SELECT * FROM department`;
    const [response] = await connection.promise().query(sql);
      console.log('All Departments:')
      console.table(response);
      promptUser();
    }  catch (error) {
      console.error(error);
    }
  };

// View all Employees by Department

const getDepartmentChoices = async () => {
  const sql = `SELECT department_name FROM department`;
  const [rows] = await connection.promise().query(sql);
  return rows.map(row => row.department_name);
}

const viewEmployeesByDepartment = async () => {
  try {
    const departmentName = await inquirer.prompt({
      name: 'department',
      type: 'list',
      message: 'Which department would you like to view?',
      choices: await getDepartmentChoices(),
    });

      const sql = `SELECT 
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
                    WHERE d.department_name = ?;`;
    const [response] = await connection.promise().query(sql, [departmentName.department]);
      console.log('Employees by Department:');
      console.table(response);
      promptUser();
    } catch (error) {
      console.error(error);
    }
  };

// View all Deparment by Budget
const viewDepartmentBudget = () => {
  console.log('Employees by Department:');
  let sql =       `SELECT department.id AS id,
                    department.department_name AS department,
                    SUM(role.salary) AS budget
                    FROM role
                    INNER JOIN department ON role.department_id = department.id GROUP BY role.department_id`;
    connection.query(sql, (error, response) => {
      if (error) throw error;
      console.table(response);
      promptUser();
    });
};

// Add new Employee
const addEmployee = async () => {
try {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'What is the employee\'s first name?',
      validate: addFirstName => {
        if (addFirstName) {
          return true;
        } else {
          console.log('Please enter a first name');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'What is the employee\'s last name?',
      validate: addLastName => {
        if (addLastName) {
          return true;
        } else {
          console.log('Please enter a last name');
          return false;
        }
      }
    }
  ]);
    const roleSql = `SELECT role.id, role.title FROM role`;
    const [roleData,] = await connection.promise().query(roleSql);
    const roles = roleData.map(({ id, title }) => ({ name: title, value: id}));
    const roleChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What is this employee\'s role?",
          choices: roles
        }
      ]);
    const role = roleChoice.role;
      
    const managerSql = `SELECT * FROM employee`;
    const [managerData,] = await connection.promise().query(managerSql);
    const managers = managerData.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id}));
    
    const managerChoice = await inquirer.prompt([
            {
              type: 'list',
              name: 'manager',
              message: "Who is the employee's manager?",
              choices: managers
            }
          ]);
    const manager = managerChoice.manager;
    const crit = [answer.first_name, answer.last_name, role, manager];
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
    await connection.promise().query(sql, crit);
    console.log('Employee added successfully');
    viewAllEmployees();
        } catch (error) {
          console.log(error);
        }
      };

// Add a new role
const addRole = async () => {
try {
  const addRole = await inquirer.prompt([
    {
      name: 'newRole',
      type: 'input',
      message: 'What is the name of this new role?',
    },
    {
      name: 'salary',
      type: 'input',
      message: 'What is the salary of this new role?',
    },
    ]);

  const departmentSql = 'SELECT * FROM department';
  const [departmentData,] = await connection.promise().query(departmentSql);
  const departments = departmentData.map(({ id, name }) => ({ name: name, value: id}));
  const departmentChoice = await inquirer.prompt([
      {
        name: 'departmentName',
        type: 'list',
        message: 'Select the department where this new role is in',
        choices: departments,
      }
    ]);
    const department = departmentChoice.departmentName;
    const crit = [addRole.newRole, addRole.salary, department];
    const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
    await connection.promise().query(sql, crit);
    console.log('Role successfully created!')
    viewAllRoles();
        } catch (error) {
          console.log(error);
        };
      };

// Add a new department
const addDepartment = async () => {
try {
    const answer = await inquirer.prompt ([
    {
      name: 'newDepartment',
      type: 'input',
      message: 'What is the name of the new department?',
    }
  ]);
  
  const createdDepartment = answer.newDepartment;
  const sql = `INSERT INTO department (department_name) VALUES (?)`;
  await connection.promise().query(sql, [createdDepartment]);
      console.log(createdDepartment + "Department successfully created!");
      viewAllDepartments();
    } catch (error) {
      console.log(error);
    }
};


// Update an Employee's role
const updateEmployeeRole = async () => {
try {
  let sql = `SELECT * FROM employee`;

  const [employeeData,] = await connection.promise().query(sql);
    let employeeNamesArray = [];
    employeeData.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
      });

    sql = `SELECT id, title FROM role`;
    const [roleData,] = await connection.promise().query(sql);      
    let rolesArray = [];
        roleData.forEach((role) => {rolesArray.push(role.title);
        });
    
    const answer = await inquirer
      .prompt ([
      {
        name: 'chosenEmployee',
        type: 'list',
        message: 'Which employee would you like to update?',
        choices: employeeNamesArray
      },
      {
        name: 'chosenRole',
        type: 'list',
        message: 'What is the new role for the employee?',
        choices: rolesArray
      }
    ])

    let newTitleId, employeeId;

      roleData.forEach((role) => {
        if (answer.chosenRole === role.title) 
          {
          newTitleId = role.id;
          }
      });

      employeeData.forEach((employee) => {
        if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`)
          {
          employeeId = employee.id;
          }
      });
      
      sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
      await connection.promise().query(sql, [newTitleId, employeeId]);
          console.log('Employee role updated successfully!');
          promptUser();
          } catch (error) {
            console.log(error);
          };
      };

// Update an Employee's manager

const updateEmployeeManager = async () => {
try {
  let sql = `SELECT * FROM employee`;

  const [employeeData,] = await connection.promise().query(sql);
    let employeeNamesArray = [];
    employeeData.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
      });

    sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`;
    const [managerData,] = await connection.promise().query(sql);      
    let managersArray = [];
        managerData.forEach((manager) => {managersArray.push(manager.name);
        });
    
    const answer = await inquirer
  .prompt([
    {
      name: 'chosenEmployee',
      type: 'list',
      message: 'Which employee has a new manager?',
      choices: employeeNamesArray
    },
    {
      name: 'newManager',
      type: 'list',
      message: 'Who is their manager?',
      choices: managersArray
    }
  ])
  let employeeId, managerId;
    employeeData.forEach((employee) => {
      if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`) 
      {
        employeeId = employee.id;
      }
    });
      managerData.forEach((manager) => {
      if (answer.newManager === manager.name) 
      {
        managerId = manager.id;
      }
      });
    if (employeeId === managerId) {
      console.log('Invalid Manager Selection');
      promptUser();
    } else {
      let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

      connection.query(
        sql,
        [managerId, employeeId],
        (error) => {
          if (error) throw error;
          console.log('Employee Manager Updated');
          promptUser();
        })
      }
    } catch (error) {
      console.log(error);
    };
  };

// Delete an Employee
const removeEmployee = async () => {
try {
  let sql =     `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name 
                  FROM employee`;
  const [employeeData] = await connection.promise().query(sql);
    let employeeNamesArray = [];
      employeeData.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
    });

   const answer = await inquirer
      .prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee would you like to remove?',
          choices: employeeNamesArray
        }
      ])
      let employeeId;
        employeeData.forEach((employee) => {
          if (
            answer.chosenEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }
        });

        let sql2 = `DELETE FROM employee WHERE employee.id = ?`;
        connection.query(sql2, [employeeId]);
          console.log(`Employee Successfully Removed`);
          await viewAllEmployees();
        } catch (error) {
          console.log(error);
        }
};

// Delete a role
const removeRole = async () => {
try {
  let sql = `SELECT role.id, role.title FROM role`;

  const [roleData,] = await connection.promise().query(sql);      
    let rolesArray = [];
        roleData.forEach((role) => {rolesArray.push(role.title);
        });

    const answer = await inquirer
      .prompt([
        {
          name: 'chosenRole',
          type: 'list',
          message: 'Which role would you like to remove?',
          choices: rolesArray
        }
      ])

      let roleId;
        roleData.forEach((role) => {
          if (answer.chosenRole === role.title) {
            roleId = role.id;
          }
        });

        let sql2 =   `DELETE FROM role WHERE role.id = ?`;
        connection.promise().query(sql2, [roleId]);
          console.log(`Role Successfully Removed`);
          await viewAllRoles();
        } catch (error) {
          console.log(error);
        };
      };

// Delete a Department

const removeDepartment = async () => {
try {
  let sql =   `SELECT department.id, department.department_name FROM department`;
  const [departmentData] = await connection.promise().query(sql);
    let departmentNamesArray = [];
      departmentData.forEach((department) => {departmentNamesArray.push(department.department_name);
    });

   const answer = await inquirer
      .prompt([
        {
          name: 'chosenDept',
          type: 'list',
          message: 'Which department would you like to remove?',
          choices: departmentNamesArray
        }
      ])
      let departmentId;
        departmentData.forEach((department) => {
          if (answer.chosenDept === department.department_name) {
            departmentId = department.id;
          }
        });

        let sql2 = `DELETE FROM department WHERE department.id = ?`;
        connection.promise().query(sql2, [departmentId]);
          console.log(`Department Successfully Removed`);
          await viewAllDepartments();
        } catch (error) {
          console.log(error);
        };
};


