const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

// pending / friend / blocked
async function get_friendship(id_s, id_r){
    try{
        const check_friendship = 'SELECT * FROM friendship WHERE ((id_1 = ? AND id_2 = ?) OR (id_1 = ? AND id_2 = ?))';
        let results = await queryPromise(check_friendship, [id_s, id_r, id_r, id_s]);

        return results;
        
    } catch (err) {
        console.error('Check error', err);
        return false;
    }
}

async function get_friendship_from_id(friendship_id){
    try{
        const check_friendship = 'SELECT * FROM friendship WHERE id = ?';
        let results = await queryPromise(check_friendship, [friendship_id]);
        
        return results;
        
    } catch (err) {
        console.error('Check error', err);
        res.status(500).json({
          message: 'Check error',
        });
    }
}

const insert_friendship = async (id_s, id_r, friendship, req, res) => {
    const new_friendship = 'INSERT INTO friendship (id_1, id_2, status) VALUES (?, ?, ?)';
    const values = [id_s, id_r, friendship]
    try {
        await queryPromise(new_friendship, values);
        console.log('Friendship inserted successfully');
        const result = await get_friendship(id_s, id_r);
        return result;
        
    } catch (err) {
        return false;
    }
}

async function get_requested(id_s){
    try{
        const check_friendship = 'SELECT * FROM friendship WHERE id_2 = ? AND status = ?';
        const results = await queryPromise(check_friendship, [id_s, 'requested']);
        
        return results;
        
    } catch (err) {
        console.error('Check error', err);
        res.status(500).json({
          message: 'Check error',
        });
    }
}

async function update_friendship(req, res, id, friend_status){
    try{
        const update_status = 'UPDATE friendship SET status = ? WHERE id = ?';
        await queryPromise(update_status, [friend_status, id]);
        return true;
        
    } catch (err) {
        console.error('Update error', err);
        return false;
    }
}

async function delete_friendship(id){
    try{
        const delete_data = 'DELETE FROM friendship WHERE id = ?'
        await queryPromise(delete_data, [id]);
        return true;
        
    } catch (err) {
        console.error('Delete error', err);
        return false;
    }
}

async function get_friend_list(user_id){
    const get_friend_list_data = 'SELECT user.id, user.name, user.picture, friendship.id AS friendship_id, friendship.status \
    FROM user LEFT JOIN friendship ON (((friendship.id_1 = user.id AND friendship.id_2 = ?) OR (friendship.id_1 = ? AND friendship.id_2 = user.id)) AND friendship.status = ?)\
    WHERE user.id != ? AND friendship.status = ?'
    try{
        console.log('Get friend list');
        const results = await queryPromise(get_friend_list_data, [user_id, user_id, 'friend', user_id, 'friend']);
        console.log('get_friend_list: ', results);
        return results;
    } catch (err) {
        console.log('get_friend_list erorr!')
        return false;
    }
}

const count_friends = async (user_id) => {
    const count_friend_data = 'SELECT COUNT(*) AS count FROM friendship WHERE ((id_1 = ? OR id_2 = ? ) AND status = ?)';
    try{
        console.log('count_friends');
        const result = await queryPromise(count_friend_data, [user_id, user_id, 'friend']);
        console.log(result[0].count);
        return result[0].count;
    } catch (err) {
      return false;
    }
  }

module.exports = {
    get_friendship,
    get_friend_list,
    get_friendship_from_id,
    get_requested,
    insert_friendship,
    update_friendship,
    delete_friendship,
    count_friends
};