const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

async function insert_post(user_id, context){
    const insertDataQuery = 'INSERT INTO post (user_id, context) VALUES (?, ?)';
    const values = [user_id, context];
    try{
        console.log('insert_post')
        const results = await queryPromise(insertDataQuery, values);
        return results.insertId;
    } catch(err) {
        console.log('Insert post error!')
        return false;
    }
}

async function update_post(post_id, context){
    const insertDataQuery = 'UPDATE post SET context = ? WHERE id = ?';
    const values = [context, post_id];
    try{
        const results = await queryPromise(insertDataQuery, values);
        return results;

    } catch(err) {
        console.log('Insert post error!')
        return false;
    }
}

async function check_post_user(user_id, post_id){
    const check_post = 'SELECT user_id FROM post WHERE id = ?';
    try{
        const user_id_from_post = await queryPromise(check_post, [post_id]);
        if(user_id == user_id_from_post[0].user_id){
            return true;
        }
        return false;

    } catch(err) {
        console.log('Insert post error!')
        return false;
    }
}

async function like_post(post_id){
    const check_post = 'SELECT like_count FROM post WHERE id = ?';
    const update_like_post = 'UPDATE post SET like_count = ? WHERE id = ?';
    try{
        const like_count = await queryPromise(check_post, [post_id]);
        const result = await queryPromise(update_like_post, [like_count[0].like_count+1, post_id]);
        return result;
    } catch (err) {
        return false;
    }
}

async function dislike_post(post_id){
    const check_post = 'SELECT like_count FROM post WHERE id = ?';
    const update_dislike_post = 'UPDATE post SET like_count = ? WHERE id = ?';
    try{
        const like_count = await queryPromise(check_post, [post_id]);
        const result = await queryPromise(update_dislike_post, [like_count[0].like_count-1, post_id]);
        return result;
    } catch (err) {
        return false;
    }
}

async function get_post_and_comment(user_id, post_id){
    console.log("get_post_and_comment")
    const get_data = 'SELECT post.id, DATE_FORMAT(post.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, post.context, post.like_count, post.comment_count, user.picture, user.name FROM post LEFT JOIN user ON post.user_id = user.id WHERE post.id = ?';
    const is_liked_result = 'SELECT id FROM like_table WHERE user_id = ? AND post_id = ?';
    try {
        const result = await queryPromise(get_data, [post_id]);
        const is_liked = await queryPromise(is_liked_result, [user_id, post_id])
        if(is_liked.length == 0){
            result[0]['is_liked'] = false;
        }
        else{
            result[0]['is_liked'] = true;
        }
        return result;
    } catch (err) {
        return false;
    }
}

async function new_comment(post_id){
    const check_post = 'SELECT comment_count FROM post WHERE id = ?';
    const update_dislike_post = 'UPDATE post SET comment_count = ? WHERE id = ?';
    try{
        const comment_count = await queryPromise(check_post, [post_id]);
        const result = await queryPromise(update_dislike_post, [comment_count[0].comment_count+1, post_id]);
        return result;
    } catch (err) {
        return false;
    }
}

async function get_post_and_comment_limit_with_userId(token_user_id, user_id, post_id, limit){
    console.log("get_post_and_comment_limit")
    limit = limit +1;
    let get_post_and_comment_limit_data = '';
    if(post_id){
        console.log('cursor exist')
        get_post_and_comment_limit_data = 'SELECT post.id, DATE_FORMAT(post.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, post.context, post.like_count, post.comment_count, user.id AS user_id, user.picture, user.name \
        FROM post LEFT JOIN user ON post.user_id = user.id \
        WHERE post.id <= ? AND post.user_id = ? \
        ORDER BY post.id DESC LIMIT ?';
        result = await queryPromise(get_post_and_comment_limit_data, [post_id, user_id, limit]);
    }
    else{
        console.log('cursor = MAX')
        get_post_and_comment_limit_data = 'SELECT post.id, DATE_FORMAT(post.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, post.context, post.like_count, post.comment_count, user.id AS user_id, user.picture, user.name \
        FROM post LEFT JOIN user ON post.user_id = user.id \
        WHERE post.id <= (SELECT MAX(id) FROM post) AND post.user_id = ? \
        ORDER BY post.id DESC LIMIT ?';
        result = await queryPromise(get_post_and_comment_limit_data, [user_id, limit]);
    }

    if(result.length === 0){
        return [];
    }
    
    const is_liked_results = 'SELECT post_id FROM like_table WHERE user_id = ? AND post_id <= ? AND post_id >= ?'
    
    try {
        const first_index = result[0].id
        const last_index = result[result.length - 1].id
        const is_liked = await queryPromise(is_liked_results, [token_user_id, first_index, last_index]);
        console.log(is_liked);

        let like_dic = [];
        is_liked.map(row => {
            like_dic[row.post_id] = true;
        })

        result.map(row => {
            console.log(like_dic[row.id])
            if (like_dic[row.id]) {
                row['is_liked'] = true;
            } 
            else{
                row['is_liked'] = false;
            }
        })
        return result;
    } catch (err) {
        return false;
    }
}

//get friend & user posts
async function get_post_and_comment_limit_without_userId(token_user_id, post_id, limit){
    console.log("get_post_and_comment_limit_without_userId")
    limit = limit +1;
    let get_post_and_comment_limit_data = ''
    let result = []
    if(post_id){
        console.log('postid exist')
        get_post_and_comment_limit_data = 'SELECT post.id, DATE_FORMAT(post.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, post.context, post.like_count, post.comment_count, user.id AS user_id, user.picture, user.name\
        FROM post \
        LEFT JOIN user ON post.user_id = user.id \
        LEFT JOIN friendship ON (((friendship.id_1 = post.user_id AND friendship.id_2 = ?) OR (friendship.id_1 = ? AND friendship.id_2 = post.user_id)) AND friendship.status = ?)\
        WHERE post.id <= ? AND (post.user_id = ? OR friendship.status = ?)\
        ORDER BY post.id DESC LIMIT ?';

        result = await queryPromise(get_post_and_comment_limit_data, [token_user_id, token_user_id, 'friend', post_id, token_user_id, 'friend', limit]);
    }
    else{
        console.log('postid not exist')
        get_post_and_comment_limit_data = 'SELECT post.id, DATE_FORMAT(post.created_at, "%Y-%m-%d %H:%i:%s") AS created_at, post.context, post.like_count, post.comment_count, user.id AS user_id, user.picture, user.name\
        FROM post \
        LEFT JOIN user ON post.user_id = user.id \
        LEFT JOIN friendship ON (((friendship.id_1 = post.user_id AND friendship.id_2 = ?) OR (friendship.id_1 = ? AND friendship.id_2 = post.user_id)) AND friendship.status = ?)\
        WHERE post.id <= (SELECT MAX(id) FROM post) AND (post.user_id = ? OR friendship.status = ?)\
        ORDER BY post.id DESC LIMIT ?';
        result = await queryPromise(get_post_and_comment_limit_data, [token_user_id, token_user_id, 'friend', token_user_id, 'friend', limit]);
    }

    if(result.length === 0){
        return [];
    }

    const is_liked_results = 'SELECT post_id FROM like_table WHERE user_id = ? AND post_id <= ? AND post_id >= ?'
    try {
        const first_index = result[0].id
        const last_index = result[result.length - 1].id
        const is_liked = await queryPromise(is_liked_results, [token_user_id, first_index, last_index]);

        let like_dic = [];
        is_liked.map(row => {
            like_dic[row.post_id] = true;
        })
        
        result.map(row => {
            console.log(like_dic[row.id])
            if (like_dic[row.id]) {
                row['is_liked'] = true;
            } 
            else{
                row['is_liked'] = false;
            }
        })
        return result;
    } catch (err) {
        return false;
    }
}

module.exports = {
    insert_post,
    update_post,
    check_post_user,
    like_post,
    dislike_post,
    get_post_and_comment,
    new_comment,
    get_post_and_comment_limit_with_userId,
    get_post_and_comment_limit_without_userId
}
