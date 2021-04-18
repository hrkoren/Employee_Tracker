const mysql = require('mysql');
const inquirer = require('inquirer');
const consTable = require('console.table');
//mysql connection information
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'HmR060404$',
    database: 'employee_trackerDB',
});
//code to start tracker program or display error
connection.connect((err) => {
    if (err) throw err;
    runTracker();
});
//function to start employee tracker
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
                'Exit'
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

                case 'Exit':
                    connection.end();
                    break;

                default:
                    console.log(`Invalid choice: ${choice.trackerChoice}`);
            }
        });
};
//query and return all employees from the employee table
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
                console.table(res);
                return runTracker();
            });
        });
};
//query department list
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
                console.table(res);
                return runTracker();
            });
        });
}
//query employee table and return all employees with a null manager_id, which identifies them as a manager
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
                console.table(res);
                return runTracker();
            });
        });
}
//add a new employee with prompts and then insert into sql table
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
                    //tried to do an array forEach loop here but it then caused errors on line 181
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
                //pull and define manager id
                let managerID = answer.manager_id;
                //pull and query id from the roles table
                let roleID = answer.roles;
                connection.query(
                    `SELECT id FROM roles WHERE title = '${answer.roles}'`, (err, res) => {
                        if (err) throw err;
                        roleID = res[0].id;
                        managerID = res[0].id;
                        //insert answers from prompts into employee table
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
//add a new role to the exiting roles table
const addRoles = () => {
    connection.query('SELECT * FROM department', (err, res) => {
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
                },
                {
                    name: 'deptID',
                    type: 'list',
                    choices() {
                        let choiceArray = [];
                        res.forEach((department) => {
                            choiceArray.push(department.id);
                        });
                        return choiceArray;
                    },
                    message: 'Which department? Choose 1 for Engineering, 2 for Sales, 3 for Legal, 4 for Marketing, 5 for Finance.'
                }
            ])
            .then((answer) => {
                let deptID = answer.name;
                connection.query(
                    `SELECT id FROM department WHERE name = '${answer.name}'`, (err, res) => {
                        if (err) throw err;
                        deptID = res[0];
                        connection.query('INSERT INTO roles SET ?',
                            {
                                title: answer.Title,
                                salary: answer.Salary,
                                department_id: deptID,
                            },
                            (err) => {
                                if (err) throw err;
                                console.log('New role added.');
                                return runTracker();
                            });
                    });
            });
    });
};
//add a new department to the existing department table
const addDepartment = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.log(res);
        inquirer
            .prompt([
                {
                    name: 'name',
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
                        runTracker();
                    });
            });
    });
};
//update the role id of the employee; could not get this function to work as expected
// const updateRole = () => {
//     connection.query('SELECT role_id FROM employee', (err, res) => {
//         if (err) throw err;
//         console.log(res);
//         inquirer
//             .prompt([
//                 {
//                     name: 'employee',
//                     type: 'list',
//                     choices() {
//                         employArray = [];
//                         [...results].forEach(employee => {
//                             employArray.push(employee.first_name + " " + employee.last_name);
//                         });
//                         return employArray;
//                     }
//                 },
//                 {
//                     name: 'roles',
//                     type: 'list',
//                     choices: [
//                         'Sales Lead',
//                         'Salesperson',
//                         'Lead Engineer',
//                         'Software Engineer',
//                         'Accountant',
//                         'Legal Team Lead',
//                         'Lawyer'
//                     ],
//                     message: 'What\'s the employee\'s new title?',
//                 },
//             ])
//             .then((answer) => {
//                 //pull and query id from the employee table
//                 let employeeID = answer.id;
//                 //pull and query id from the roles table
//                 let roleID = answer.roles;
//                 connection.query(
//                     'SELECT id FROM employee', (err, res) => {
//                         if (err) throw err;
//                         employeeID = res[0].id;
//                         //insert answers from prompts into employee table
//                         try {
//                             connection.query(
//                                 'UPDATE employee SET ?',
//                                 {
//                                     role_id: roleID,
//                                 },
//                                 (err) => {
//                                     if (err) throw err;
//                                     console.log('New title added.');
//                                 }
//                             );
//                         } catch (err) {
//                             console.log(err);
//                         }
//                         runTracker();
//                     });
//             });
//     });
// };