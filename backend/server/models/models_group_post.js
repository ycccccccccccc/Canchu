//此 TABLE 叫做 'group_table'
const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

async function post_in_group(group_id, user_id, context){
    const insertDataQuery = 'INSERT INTO group_post (group_id, user_id, context) VALUES (?, ?, ?)';
    const values = [group_id, user_id, context];
    try{
        console.log('insert post in group')
        const results = await queryPromise(insertDataQuery, values);
        return results.insertId;
    } catch(err) {
        console.error('Insert post error!')
        return false;
    }
}

async function get_post_in_group(group_id){
    const get_posts_data = 'SELECT group_post.id, group_post.user_id, DATE_FORMAT(group_post.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, group_post.like_count, group_post.context, group_post.comment_count, user.picture, user.name \
    FROM group_post LEFT JOIN user ON group_post.user_id = user.id\
    WHERE group_id = ?';
    try{
        return await queryPromise(get_posts_data, [group_id]);
    } catch (err) {
        return false;
    }
}

// async function del_group(group_id){
//     const delete_group_data = 'DELETE FROM group_table WHERE post_id = ?'
//     try{
//         return await queryPromise(delete_group_data, [group_id]);
//     } catch (err) {
//         return false;
//     }
// }

// async function get_member_pending(group_id){
//     const get_member_data = 'SELECT user.id, user.name, user.picture FROM member LEFT JOIN user ON member.user_id = user.id WHERE member.group_id = ? AND member.identity = ?';
//     try{
//         return await queryPromise(get_member_data, [group_id, 'request']);
//     } catch (err) {
//         return false;
//     }
// }

// async function agree_member(group_id, user_id){
//     try{
//         const update_status = 'UPDATE member SET identity = ? WHERE group_id = ? AND user_id = ? AND identity = ?';
//         const result = await queryPromise(update_status, ['member', group_id, user_id, 'request']);
//         return result;
//     } catch (err) {
//         return false;
//     }
// }



module.exports = {
    post_in_group,
    get_post_in_group
}