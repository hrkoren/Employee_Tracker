const { reject } = require('lodash');
const mysql = require('mysql');
const { resolve } = require('node:path');

class employeeDatabase {
    constructor(employeeTrackerCode) {
        this.connection = mysql.createConnection(employeeTrackerCode);
    }
    query (sql, queryArgs) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, queryArgs, (err, rows) => {
                if(err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

end() {
    return new Promise((resolve, reject) => {
        this.connection.end(err => {
            if(err)
            return(reject(err); 
            resolve();
        });
        });
    }
}

module.exports = employeeDatabase;