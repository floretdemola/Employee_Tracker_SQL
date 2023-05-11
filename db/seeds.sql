INSERT INTO department (department_name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
       ("Sales Associate", 60000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 125000, 2),
       ("Accountant", 125000, 3),
       ("Lawyer", 180000, 4),
       ("Account Manager", 130000, 3),
       ("Legal Team Lead", 250000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, null),
       ("Mike", "Chan", 2, 1),
       ("Ashley", "Rodriguez", 3, null),
       ("Kevin", "Tupik", 4, 3),
       ("Kunal", "Singh", 5, 7),
       ("Malia", "Brown", 6, 8),
       ("Sarah", "Lourd", 7, null),
       ("Tom", "Allen", 8, null);