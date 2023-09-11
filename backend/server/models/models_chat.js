const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

async function insert_message(sender_id, recipient_id, message){
    const insert_message_data = 'INSERT INTO chat (sender_id, recipient_id, message) VALUES (?, ?, ?)';
    try{
        const result = await queryPromise(insert_message_data, [sender_id, recipient_id, message]);
        return result.insertId;
    } catch (err) {
        return false;
    }
}

async function get_message(id_1, id_2, post_id, limit){
    try {
        limit = limit +1;
        let result = []
        if(post_id){
            console.log('cursor exist')
            const get_data = 'SELECT chat.id AS message_id, chat.message, DATE_FORMAT(chat.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, user.id AS user_id, user.name, user.picture \
            FROM chat LEFT JOIN user ON user.id = chat.sender_id\
            WHERE chat.id <= ? AND ((chat.sender_id = ? AND chat.recipient_id = ?) OR (chat.recipient_id = ? AND chat.sender_id = ?))\
            ORDER BY chat.id DESC LIMIT ?';
            result = await queryPromise(get_data, [post_id, id_1, id_2, id_1, id_2, limit]);
        }
        else{
            console.log('cursor = MAX')
            const get_data = 'SELECT chat.id AS message_id, chat.message, DATE_FORMAT(chat.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, user.id AS user_id, user.name, user.picture \
            FROM chat LEFT JOIN user ON user.id = chat.sender_id\
            WHERE chat.id <= (SELECT MAX(chat.id)) AND ((chat.sender_id = ? AND chat.recipient_id = ?) OR (chat.recipient_id = ? AND chat.sender_id = ?))\
            ORDER BY chat.id DESC LIMIT ?';
            result = await queryPromise(get_data, [id_1, id_2, id_1, id_2, limit]);
        }

        if(result.length === 0){
            return [];
        }

        let messages = []
        result.map(row => {
            const message = {
                "id": row.message_id,
                "message": row.message,
                "create_at": row.created_at,
                "user":{
                    "id": row.user_id,
                    "name": row.name,
                    "picture": row.picture
                }
            }
            messages.push(message); 
        })
        return messages;
    } catch (err) {
        return false;
    }
}

module.exports = {
    insert_message,
    get_message
}