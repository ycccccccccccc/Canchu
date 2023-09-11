//此 TABLE 叫做 'group_table'
const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

// creator | request | pending | member
async function post_member(group_id, user_id, identity){
    const insertDataQuery = 'INSERT INTO member (group_id, user_id, identity) VALUES (?, ?, ?)';
    const values = [group_id, user_id, identity];
    try{
        console.log('insert member')
        const results = await queryPromise(insertDataQuery, values);
        return results.insertId;
    } catch(err) {
        console.error('Insert post error!')
        return false;
    }
}

async function get_member(group_id, user_id){
    const get_member_data = 'SELECT id, identity FROM member WHERE group_id = ? AND user_id = ?';
    try{
        return await queryPromise(get_member_data, [group_id, user_id]);
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

async function get_member_pending(group_id){
    const get_member_data = 'SELECT user.id, user.name, user.picture FROM member LEFT JOIN user ON member.user_id = user.id WHERE member.group_id = ? AND member.identity = ?';
    try{
        return await queryPromise(get_member_data, [group_id, 'request']);
    } catch (err) {
        return false;
    }
}

async function agree_member(group_id, user_id){
    try{
        const update_status = 'UPDATE member SET identity = ? WHERE group_id = ? AND user_id = ? AND identity = ?';
        const result = await queryPromise(update_status, ['member', group_id, user_id, 'request']);
        return result;
    } catch (err) {
        return false;
    }
}



module.exports = {
    post_member,
    get_member,
    get_member_pending,
    agree_member,

}