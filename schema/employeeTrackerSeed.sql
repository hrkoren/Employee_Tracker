USE employee_trackerdb;

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Michael", "Westin", 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Sam", "Axe", 2, 1)
    ("James", "Dean", 5, 5);

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Engineer", 95,000, 1);

INSERT INTO department (name)
VALUES ("Engineering");