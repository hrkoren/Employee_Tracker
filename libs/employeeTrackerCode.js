const mysql = require('mysql');
const inquirer = require('inquirer');
const console = require('console.table');

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
            'Remove Employee',
            'Update Employee Role',
            'Update Employee Manager',
        ],
    })
    .then((choice) => {
        switch(choice.trackerChoice) {
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
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;

            case 'Update Employee Manager':
                updateManager();
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
        const query = 'SELECT * FROM employee LEFT JOIN roles ON employee.role_id = roles.id';
        connection.query(query, { employee: answer.employee }, (err, res) => {
            if (err) throw err;
            res.forEach(({ id, first_name, last_name, roles_id, department_id, salary, manager_id }) => {
                console.log(`ID: ${id} || First Name: ${first_name} || Last Name: ${last_name} || Title: ${roles_id} || Department: ${department_id} || Salary: ${salary} || Manager: ${manager_id}`);
        });
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
        const query = 'SELECT * FROM ';
        connection.query(query, {}, (err, res)=> {
            if(err) throw err;
            res.foreach(())
        });
    });
}

const addEmployee = () => {
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
        type: 'choice',
        choices: [
            'Sales Team Lead',
            'Salesperson',
            'Lead Engineer',
            'Software Engineer',
            'Accountant',
            'Legal Team Lead',
            'Lawyer'
        ],
    },
    {
        name: 'salary',
        type: 'input',
        message: 'Enter the new employee\'s salary.',
    },
    {
        name: 'manager',
        type: 'input',
        message: 'Enter the new employee\'s manager.'
    }
    ])
    .then((answer) => {
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
            },
            (err) => {
                if (err) throw err;
                console.log('New employee added.');
                start();
            }
        );
    });
};