const mysql = require('mysql');
const inquirer = require('inquirer');
const consTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'HmR060404$',
    database: 'employee_trackerDB',
});

connection.connect((err) => {
    if (err) throw err;
    runTracker();
});

const runTracker = () => {
    inquirer
        .prompt({
            name: 'trackerChoice',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Employees By Department',
                'View All Employees By Manager',
                'Add Employee',
                'Add Department',
                'Add Employee Role',
                'Update Employee Role',
            ],
        })
        .then((choice) => {
            switch (choice.trackerChoice) {
                case 'View All Employees':
                    employeeSearch();
                    break;

                case 'View All Employees By Department':
                    departSearch();
                    break;

                case 'View All Employees By Manager':
                    managerSearch();
                    break;

                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Add Department':
                    addDepartment();
                    break;

                case 'Add Employee Role':
                    addRoles();
                    break;

                case 'Update Employee Role':
                    updateRole();
                    break;

                default:
                    console.log(`Invalid choice: ${choice.trackerChoice}`);
            }
        });
};

const employeeSearch = () => {
    inquirer
        .prompt([
            {
                name: 'search',
                type: 'confirm',
                message: 'View employee list.',
            }
        ])
        .then((answer) => {
            const query = `SELECT e.id, e.first_name, e.last_name, title, salary, department.name, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employee as e LEFT JOIN roles ON e.role_id = roles.id LEFT JOIN department ON department.id = roles.department_id LEFT JOIN employee manager on manager.id = e.manager_id group by e.first_name`;
            connection.query(query, { employee: answer.employee }, (err, res) => {
                if (err) throw err;
                // res.forEach(({ first_name, last_name, title, name, salary, Manager }) => {
                // console.log(`First Name: '${first_name}' || Last Name: '${last_name}' || Title: '${title}' || Salary: ${salary} Department: '${name}' || Manager:'${Manager}'`);
                console.table(res);
                // });
                return runTracker();
            });
        });
};

const departSearch = () => {
    inquirer
        .prompt([
            {
                name: 'search',
                type: 'confirm',
                message: 'View department list'
            }
        ])
        .then((answer) => {
            const query = 'SELECT department.name, first_name, last_name FROM department as d LEFT JOIN department ON d.name = d.name RIGHT JOIN roles ON roles.id = roles.department_id RIGHT JOIN employee ON role_id = roles.id group by first_name';
            connection.query(query, {}, (err, res) => {
                if (err) throw err;
                // res.forEach(({ name, first_name, last_name }) => {
                // console.log(`Department: ${name} || First Name: ${first_name} || Last Name: ${last_name}`);
                console.table(res);
            });
            return runTracker();
        });
}

const managerSearch = () => {
    inquirer
        .prompt([
            {
                name: 'search',
                type: 'confirm',
                message: 'View all managers'
            }
        ])
        .then((answer) => {
            const query = 'SELECT first_name, last_name FROM employee where manager_id is null;';
            connection.query(query, {}, (err, res) => {
                if (err) throw err;
                // res.forEach(({ first_name, last_name }) => {
                // console.log(`First Name: ${first_name} || Last Name: ${last_name}`);
                console.table(res);
            });
            return runTracker();
        });
}

const addEmployee = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        console.log(results);
        inquirer
            .prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'Please enter the first name for the new employee.',
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: 'Please enter the last name for the new employee.'
                },
                {
                    name: 'roles',
                    type: 'list',
                    choices: [
                        'Sales Lead',
                        'Salesperson',
                        'Lead Engineer',
                        'Software Engineer',
                        'Accountant',
                        'Legal Team Lead',
                        'Lawyer'
                    ],
                    message: 'What\'s the new employee\'s title?',
                },
                {
                    name: 'manager',
                    type: 'list',
                    choices() {
                        const choiceArray = [];
                        [...results].forEach((manager) => {
                            choiceArray.push(manager.first_name + " " + manager.last_name);
                        });
                        return choiceArray;
                    },
                    message: 'Enter the new employee\'s manager.'
                }
            ])
            .then((answer) => {
                console.log(answer);
                let managerID = answer.manager_id;
                let roleID = answer.roles;
                connection.query(
                    `SELECT id FROM roles WHERE title = '${answer.roles}'`, (err, res) => {
                        if (err) throw err;
                        roleID = res[0].id;
                        // console.log(answer.roles);
                        // console.log(roleID);
                        managerID = res[0].id;
                        console.log(answer.manager_id);
                        console.log(managerID);
                        try {
                            connection.query(
                                'INSERT INTO employee SET ?',
                                {
                                    first_name: answer.firstName,
                                    last_name: answer.lastName,
                                    role_id: roleID,
                                    manager_id: managerID,
                                },
                                (err) => {
                                    if (err) throw err;
                                    console.log('New employee added.');
                                }
                            );
                        } catch (err) {
                            console.log(err);
                        }
                        runTracker();
                    });
            })
    });
};

const addRoles = () => {
    connection.query('SELECT * FROM roles', (err, res) => {
        if (err) throw err;
        console.log(res);
    inquirer
        .prompt([
            {
                name: 'Title',
                type: 'input',
                message: 'What is the new title?',
            },
            {
                name: 'Salary',
                type: 'input',
                message: 'What is the salary for the new title?',
            }
        ])
        .then((answer) => {
            connection.query('INSERT INTO roles SET ?',
                {
                    title: answer.Title,
                    salary: answer.Salary,
                },
            (err) => {
                if (err) throw err;
                console.log('New role added.');
            });
            runTracker();
        });
    });
};

const addDepartment = () => {
    connection.query('SELECT * FROM department', (err, res) => {
	        if (err) throw err;
            console.log(res);
        inquirer
            .prompt([
                {
                    name: 'Department',
                    type: 'input',
                    message: 'What new department do you want to add?'
                },
            ])
             .then((answer) => {
                connection.query('INSERT INTO department SET ?',
                    {
                        name: answer.name,
                    },
                (err) => {
                    if (err) throw err;
                    console.log('New department added.');
                });
                runTracker();
            });
    });
};