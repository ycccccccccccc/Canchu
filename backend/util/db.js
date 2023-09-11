const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

let database = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'stress-test') ? 'canchu_test' : 'canchu';
let host = process.env.SERVER_ === 'RDS' 
    ? process.env.RDS_DB_host 
    : process.env.SERVER_ === 'local' 
    ? process.env.LOCAL_DB_host 
    : process.env.DOCKER_DB_host;

const connection = mysql.createConnection({
    host: host,
    user: 'root',
    password: process.env.DB_password,
    database: database,
    multipleStatements: true
});
const queryPromise = util.promisify(connection.query).bind(connection);

connection.connect();

if (process.env.SERVER === 'RDS' ){

}

module.exports = {
    connection,
    queryPromise
};
