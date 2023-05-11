// Imported required packages
const inquirer = require('inquirer');
const connection = require('./server');


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
const viewAllEmployees = () => {
let sql =       `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
  connection.promise().query(sql, (error, res) => {
    if (error) throw error;
    console.log('Current Employees:');
    console.table(res);
    promptUser();
  });
};

// View all Roles
const viewAllRoles = () => {
  let sql =       `SELECT role.id,
                    role.title,
                    department.department_name AS department
                    FROM role
                    INNER JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (error, res) => {
      if (error) throw error;
      res.forEach((role) => {console.log(role.title);
      });
      promptUser();
    });
};

// View all departments
const viewAllDepartments = () => {
  let sql =       `SELECT department.id AS id,
                    department.department_name AS department FROM department`;
    connection.promise().query(sql, (error, res) => {
      if (error) throw error;
      console.log('All Departments:')
      console.table(res);
      promptUser();
    });
};

// View all Employees by Department
const viewEmployeesByDepartment = () => {
  let sql =       `SELECT employee.first_name,
                    employee.last_name, 
                    department.department_name AS department
                    FROM employee 
                    LEFT JOIN role ON employee.role_id = role.id 
                    LEFT JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, res) => {
      if (error) throw error;
      console.log('Employees by Department:');
      console.table(res);
      promptUser();
    });
};

// View all Deparment by Budget
const viewDepartmentBudget = () => {
  console.log('Employees by Department:');
  let sql =       `SELECT department.id AS id,
                    department.department_name AS department,
                    SUM(role.salary) AS budget
                    FROM role
                    INNER JOIN department ON role.department_id = department.id GROUP BY role.department_id`;
    connection.query(sql, (error, res) => {
      if (error) throw error;
      console.table(res);
      promptUser();
    });
};

// Add new Employee
const addEmployee = () => {
  inquirer.prompt([
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
  ])
  .then(answer => {
    const crit = [answer.first_name, answer.last_name]
    const roleSql = `SELECT role.id, role.title FROM role`;
    connection.promise().query(roleSql, (error, data) => {
      if (error) throw error;
      const roles = data.map(({ id, title }) => ({ name: title, value: id}));
      inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What is this employee\'s role?",
          choices: roles
        }
      ])
      .then(roleChoice => {
        const role = roleChoice.role;
        crit.push(role);
        const managerSql = `SELECT * FROM employee`;
        connection.promise().query(managerSql, (error, data) => {
          if (error) throw error;
          const managers = data.map(({ id, first_name, last_name}) => ({ name: first_name + " "+ last_name, value: id}));
          inquirer.prompt([
            {
              type: 'list',
              name: 'manager',
              message: "Who is the employee's manager?",
              choices: managers
            }
          ])
          .then(managerChoice => {
            const manager = managerChoice.manager;
            crit.push(manager);
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            connection.query(sql, crit, (error) => {
              if (error) throw error;
              console.log('Employee added successfully');
              viewAllEmployees();
            });
          });
        });
     });
    });
  })
};

// Add a new role
const addRole = () => {
const sql = 'SELECT * FROM department'

  connection.promise().query(sql, (error, res) => {
    if (error) throw error;
    let deptNamesArray = [];
    res.forEach((department) => {deptNamesArray.push(department.department_name);
    });
    deptNamesArray.push('Create Department');
    inquirer
    .prompt([
      {
        name: 'departmentName',
        type: 'list',
        message: 'Select the department where this new role is in',
        choices: deptNamesArray
      }
    ])
    .then((answer) => {
      if (answer.departmentName === 'Create Department'){
        this.addDepartment();
      } else {
        addRoleResume(answer);
      }
    });

    const addRoleResume = (departmentData) => {
      inquirer
      .prompt ([
        {
          name: 'newRole',
          type: 'input',
          message: 'What is the name of this new role?',
          validate: validate.validateString
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What is the salary of this new role?',
          validate: validate.validateSalary
        }
      ])
      .then((answer) => {
        let createdRole = answer.newRole;
        let departmentId;

        res.forEach((department) => {
          if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
        });
        let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
        let crit = [createdRole, answer.salary, departmentId];

        connection.promise().query(sql, crit, (error) => {
          if (error) throw error;
          console.log("Role successfully created!");
          viewAllRoles();
        });
      });
    };
  });
};


// Add a new department
const addDepartment = () => {
  inquirer
  .prompt ([
    {
      name: 'newDepartment',
      type: 'input',
      message: 'What is the name of the new department?',
      validate: validate.validateString
    }
  ])
  .then((answer) => {
    let createdDepartment = answer.newDepartment;
    let sql = `INSERT INTO department (department_name) VALUES (?)`;
    connection.query(sql, createdDepartment, (error, res) => {
      if (error) throw error;
      console.log(createdDepartment + "Department successfully created!");
      viewAllDepartments();
    });
  });
};


// Update an Employee's role
const updateEmployeeRole = () => {
  let sql =     `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.id AS "role_id"
                  FROM employee, role, department 
                  WHERE department.id = role.department_id AND role.id = employee.role_id`;

  connection.promise().query(sql, (error, res) => {
    if (error) throw error;
    let employeeNamesArray = [];
      res.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
      });

    let sql = `SELECT role.id, role.title FROM role`;
    connection.promise().query(sql, (error, res) => {
      if (error) throw error;
      let rolesArray = [];
        res.forEach((role) => {rolesArray.push(role.title);
        });
    
    inquirer
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
    .then((answer) => {
      let newTitleId, employeeId;

      res.forEach((role) => {
        if (answer.chosenRole === role.title) 
          {
          newTitleId = role.id;
          }
      });

      res.forEach((employee) => {
        if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`)
          {
          employeeId = employee.id;
          }
      });
      
      let sqls = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
      connection.query(
        sqls, [newTitleId, employeeId],
        (error) => {
          if (error) throw error;
          console.log('Employee role updated successfully!');
          promptUser();
          });
        });
    });
  });
};

// Update an Employee's manager

const updateEmployeeManager = () => {
  let sql =     `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  employee.manager_id
                  FROM employee`;

    connection.promise().query(sql, (error, res) => {
      if (error) throw error;
      let employeeNamesArray = [];
      res.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

  inquirer
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
      choices: employeeNamesArray
    }
  ])
  .then((answer) => {
    let employeeId, managerId;
    res.forEach((employee) => {
      if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`) 
      {
        employeeId = employee.id;
      }
      if (answer.newManager === `${employee.first_name} ${employee.last_name}`) 
      {
        managerId = employee.id;
      }
      });
    if (answer.chosenEmployee === answer.newManager) {
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
    });
  });
};

// Delete an Employee
const removeEmployee = () => {
  let sql =     `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name FROM employee`;
    
    connection.promise().query(sql, (error, res) => {
      if (error) throw error;
      let employeeNamesArray = [];
      res.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

    inquirer
      .prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee would you like to remove?',
          choices: employeeNamesArray
        }
      ])
      .then((answer) => {
        let employeeId;
        response.forEach((employee) => {
          if (
            answer.chosenEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }
        });

        let sql = `DELETE FROM employee WHERE employee.id = ?`;
        connection.query(sql, [employeeId], (error) => {
          if (error) throw error;
          console.log(`Employee Successfully Removed`);
          viewAllEmployees();
        });
      });
  });
};

// Delete a role
const removeRole = () => {
  let sql = `SELECT role.id, role.title FROM role`;

  connection.promise().query(sql, (error, res) => {
    if (error) throw error;
    let roleNamesArray = [];
    res.forEach((role) => {roleNamesArray.push(role.title);});

    inquirer
      .prompt([
        {
          name: 'chosenRole',
          type: 'list',
          message: 'Which role would you like to remove?',
          choices: roleNamesArray
        }
      ])
      .then((answer) => {
        let roleId;
        res.forEach((role) => {
          if (answer.chosenRole === role.title) {
            roleId = role.id;
          }
        });

        let sql =   `DELETE FROM role WHERE role.id = ?`;
        connection.promise().query(sql, [roleId], (error) => {
          if (error) throw error;
          console.log(`Role Successfully Removed`);
          viewAllRoles();
        });
      });
  });
};

// Delete a Department

const removeDepartment = () => {
  let sql =   `SELECT department.id, department.department_name FROM department`;
  connection.promise().query(sql, (error, res) => {
    if (error) throw error;
    let departmentNamesArray = [];
    res.forEach((department) => {departmentNamesArray.push(department.department_name);});

    inquirer
      .prompt([
        {
          name: 'chosenDept',
          type: 'list',
          message: 'Which department would you like to remove?',
          choices: departmentNamesArray
        }
      ])
      .then((answer) => {
        let departmentId;

        res.forEach((department) => {
          if (answer.chosenDept === department.department_name) {
            departmentId = department.id;
          }
        });

        let sql =     `DELETE FROM department WHERE department.id = ?`;
        connection.promise().query(sql, [departmentId], (error) => {
          if (error) throw error;
          console.log(`Department Successfully Removed`);
          viewAllDepartments();
        });
      });
  });
};


