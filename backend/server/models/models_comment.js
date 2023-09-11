const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
const { new_comment } = require('./models_post');
require('dotenv').config();

async function insert_comment(user_id, post_id, comment){
    const insert_comment_data = 'INSERT INTO comment (user_id, post_id, comment) VALUES (?, ?, ?)';
    try{
        console.log('insert_comment')
        const result = await queryPromise(insert_comment_data, [user_id, post_id, comment])
        const comment_count_plus = await new_comment(post_id);

        return result.insertId;
    } catch (err) {
        return false;
    }
}

async function get_comment(post_id){
    console.log("get comment!");
    const get_data = 'SELECT comment.id AS comment_id, comment.created_at, comment.comment, comment.user_id, user.name, user.picture FROM comment LEFT JOIN user ON comment.user_id = user.id WHERE comment.post_id = ?';
    try {
        const result = await queryPromise(get_data, [post_id]);
        let comments = []
        result.map(row => {
            const comment = {
                "id": row.comment_id,
                "create_at": row.created_at,
                "content": row.comment,
                "user":{
                    "id": row.user_id,
                    "name": row.name,
                    "picture": row.picture
                }
            }
            comments.push(comment); 
        })
        return comments;
    } catch (err) {
        return false;
    }
}

module.exports = {
    insert_comment,
    get_comment
}