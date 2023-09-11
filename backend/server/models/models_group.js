//此 TABLE 叫做 'group_table'
const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

async function post_group(user_id, group_name){
    const insertDataQuery = 'INSERT INTO group_table (user_id, name) VALUES (?, ?)';
    const values = [user_id, group_name];
    try{
        console.log('insert group')
        const results = await queryPromise(insertDataQuery, values);
        return results.insertId;
    } catch(err) {
        console.error('Insert post error!')
        return false;
    }
}

async function get_group(group_id){
    const get_group_data = 'SELECT id, user_id FROM group_table WHERE id = ?';
    try{
        return await queryPromise(get_group_data, [group_id]);
    } catch (err) {
        return false;
    }
}

async function del_group(group_id){
    const delete_group_data = 'DELETE FROM group_table WHERE id = ?'
    try{
        return await queryPromise(delete_group_data, [group_id]);
    } catch (err) {
        return false;
    }
}



module.exports = {
    post_group,
    get_group,
    del_group,


}