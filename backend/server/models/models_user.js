const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
require('dotenv').config();
const { queryPromise } = require('../../util/db'); // 导入 db.js 文件


//Example: insert_user(req, res)
const insert_user = async (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const values = ['native', req.body.name, req.body.email, hashedPassword];
    const insertDataQuery = 'INSERT INTO user (provider, name, email, password) VALUES (?, ?, ?, ?)';
    try{
        const result = await queryPromise(insertDataQuery, values);
        console.log('Data inserted successfully');
        const token = jwt.sign(
            {
                id: result.insertId,
                name: req.body.name, 
                email: req.body.email
            }, process.env.SECRET, { expiresIn: '1 hour' });
    
          res.status(200).json({
            message: 'Create user',
            data: {
              access_token: token,
                user:{
                  id: req.body.id,
                  provider: 'native',
                  name: req.body.name,
                  email: req.body.email,
                  picture: req.body.picture
                }
            },
        });
    } catch (err) {
        console.log('Data inserted error', err);
        res.status(500).json({
            message: 'Data inserted error', err
        });
    }
}

async function find_user_from_mail(email){
    try{
        console.log('find_user_from_mail')
        const check_mail_exist = 'SELECT * FROM user WHERE email = ?';
        const results = await queryPromise(check_mail_exist, [email]);
        return results;
    } catch (err) {
        console.error('Check error', err);
        return false;
    }
}

async function find_user_from_id(req, res){
    try{
        const check_id_exist = 'SELECT * FROM user WHERE id = ?';
        const results = await queryPromise(check_id_exist, [req.params.id]);
        return results;
    } catch (err) {
        console.error('Check error', err);
        res.status(403).json({
          message: "Can not find user's info from id",
        });
    }
}

async function find_user_from_id_token(id, req, res){
    try{
        const check_id_exist = 'SELECT * FROM user WHERE id = ?';
        const results = await queryPromise(check_id_exist, [id]);
        return results;
    } catch (err) {
        console.error('Check error', err);
        res.status(403).json({
          message: "Can not find user's info from param",
        });
    }
}

//request: 你寄送的交友邀請
//peding: 你要回覆的交友邀請
async function search_user(user_id, search_name){
    try{
        const search_user_data_1 = 'SELECT user.id, user.name, user.picture, friendship.id AS friendship_id, friendship.id_1, friendship.id_2, friendship.status FROM user LEFT JOIN friendship ON user.id = friendship.id_1 WHERE user.name LIKE ?';
        const search_user_data_2 = 'SELECT user.id, user.name, user.picture, friendship.id AS friendship_id, friendship.id_1, friendship.id_2, friendship.status FROM user LEFT JOIN friendship ON user.id = friendship.id_2 WHERE user.name LIKE ?';
        const value = [`%${search_name}%`, user_id]
        // const 
        let result1 = await queryPromise(search_user_data_1, value);
        let result2 = await queryPromise(search_user_data_2, value);
        const result = result1.concat(result2);

        let user_id_dict = {}
        let users = [];
        result.map(row => {
            //沒見過這個user id
            if(!(row.id in user_id_dict)){
                let friendship_data = {}
                //friendship is null or (id_1, id_2) 組合不為 (user_id, row.id) or (row.id, user_id)
                if(row.status == null || !((row.id_1 == row.id && row.id_2 == user_id) || (row.id_1 == user_id && row.id_2 == row.id))){
                    friendship_data = null;
                }
                else{
                    friendship_data = {
                        id: row.friendship_id,
                        status: row.status
                    }
                }
                const user = {
                    id: row.id,
                    name: row.name,
                    picture: row.picture,
                    friendship: friendship_data
                }
                user_id_dict[row.id] = Object.keys(user_id_dict).length;
                users.push(user);
            }
            //id in user_id_list
            else{
                let friendship_data = {}
                if(row.status != null || ((row.id_1 === row.id && row.id_2 === user_id) || (row.id_1 === user_id && row.id_2 === row.id))){
                    friendship_data = {
                        id: row.friendship_id,
                        status: row.status
                    }
                    const user_index = user_id_dict[row.id];
                    users[user_index]['friendship'] = friendship_data;
                }
            }
        })
        return users;
    } catch (err) {
        console.log("Select error");
        return false;
    }
}

async function update_picture(user_id, picture_path){
    const update_picture_data = 'UPDATE user SET picture = ? WHERE id = ?';
    try{
        const result = await queryPromise(update_picture_data, [picture_path, user_id]);
        return result;
    } catch (err) {
        return false;
    }
}

async function update_user(introduction, tags, user_id){
    const check_user = 'UPDATE user SET introduction = ?, tags = ? WHERE id = ?';
    try{
        const result = await queryPromise(check_user, [introduction, tags, user_id]);
        return result;
    } catch (err) {
        return false;
    }
}

async function get_user_from_post_id(post_id){
    const get_user_from_post_id_data = 'SELECT user.id, user.picture, user.name \
    FROM post LEFT JOIN user ON post.user_id = user.id WHERE post.id = ?';
    try{
        const result = await queryPromise(get_user_from_post_id_data, [post_id]);
        return result;
    } catch (err) {
        return false;
    }

}

async function get_user_from_id(id){
    const get_data = 'SELECT name, picture FROM user WHERE id = ?'
    try{
        const result = await queryPromise(get_data, [id]);
        return result;
    } catch (err) {
        return false;
    }
}

module.exports = {
    insert_user,
    find_user_from_mail,
    find_user_from_id,
    find_user_from_id_token,
    search_user,
    update_picture,
    update_user,
    get_user_from_post_id,
    get_user_from_id
};
