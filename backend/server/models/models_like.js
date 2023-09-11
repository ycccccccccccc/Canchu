const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
const { like_post, dislike_post } = require('./models_post');
require('dotenv').config();

async function insert_like(post_id, user_id){
    const insert_like_data =  'INSERT INTO like_table (post_id, user_id) VALUES (?, ?)';
    try{
        const result = await queryPromise(insert_like_data, [post_id, user_id]);
        const update_result = await like_post(post_id);
        return result;
    } catch (err) {
        return false;
    }
}

async function delete_like(post_id, user_id){
    const delete_like_data = 'DELETE FROM like_table WHERE post_id = ? AND user_id = ?'
    try{
        console.log('delete_like')
        const result = await queryPromise(delete_like_data, [post_id, user_id]);
        const update_result = await dislike_post(post_id);
        return result;
    } catch (err) {
        return false;
    }
}

module.exports = {
    insert_like,
    delete_like
}