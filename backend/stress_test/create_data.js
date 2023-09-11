const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const mysql = require('mysql2');
const util = require('util');
const { create_DB } = require('./create_database');
require('dotenv').config();

let host = process.env.SERVER_ === 'RDS' 
    ? process.env.RDS_DB_host 
    : process.env.SERVER_ === 'local' 
    ? process.env.LOCAL_DB_host 
    : process.env.DOCKER_DB_host;

(async () =>{   
    if(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'stress-test'){
        const connection = mysql.createConnection({
            host: host,
            user: 'root',
            password: process.env.DB_password,
            database: 'canchu_test',
            multipleStatements: true
        });
        
        connection.connect();
        const queryPromise = util.promisify(connection.query).bind(connection);
        await create_DB(queryPromise);
        
        const mock_data = async (userCount, postCount) => {
            let users = [];
            let posts = [];
        
            for (let i = 0; i < userCount; i++) {
                let hashedPassword = bcrypt.hashSync(`user_${i}`, salt);
                let values = ['native', `user_${i}`, `user_${i}@gmail.com`, hashedPassword];
                let mock_user = `INSERT INTO user (provider, name, email, password) VALUES (?, ?, ?, ?)`;
                try {
                    let result = await queryPromise(mock_user, values);
                } catch (err) {
                    console.error('User exist!!!', err)
                }
            }
            const find_user = `SELECT id FROM user ORDER BY id DESC LIMIT ?`;
            const result = await queryPromise(find_user, [userCount]);
            users = result.map(item => item.id);
        
            for (let i = 0; i < postCount; i++) {
                for (let j = 0; j < userCount; j++) {
                    let context = `user ${users[j]} の 第 ${i} 篇文章`;
                    let mock_post = 'INSERT INTO post (user_id, context) VALUES (?, ?)';
                    let values = [users[j], context];
                    try {
                        let results = await queryPromise(mock_post, values);
                        posts.push(results.insertId);
                    } catch (err) {
                        console.error('Post error!!! ')
                    }
                }
            }
        };
        
        mock_data(3, 2000).then(() => {
            connection.end(); // 在所有操作完成後關閉連接
        }).catch((error) => {
            console.error('Error:', error);
            connection.end(); // 如果出現錯誤，也要確保關閉連接
        });
    } else {
        connection.end(); // 如果不是測試環境，直接關閉連接
    }}
)();