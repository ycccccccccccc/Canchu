const { queryPromise } = require('../../util/db'); // 导入 db.js 文件
require('dotenv').config();

async function get_event(user_id){
    const get_event_data = 'SELECT id, user_id, type, summary, is_read, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at FROM event WHERE user_id = ? ORDER BY id DESC';
    try{
        return await queryPromise(get_event_data, [user_id]);
    } catch (err) {
        return false;
    }
}

// DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at

async function get_event_from_event_id(event_id){
    const get_event_data = 'SELECT user_id FROM event WHERE id = ? ORDER BY id DESC';
    try{
        return await queryPromise(get_event_data, [event_id]);
    } catch (err) {
        return false;
    }
}

async function read_event(event_id){
    try{
        const read_event = 'UPDATE event SET is_read = ? WHERE id = ?';
        const result = await queryPromise(read_event, [true, event_id]);
        return true;
    } catch (err) {
        console.error('Update error', err);
        return false;
    }
}

// function dateTime2str(dateTime, format) {
//     var z = {
//         y: dateTime.getFullYear(),
//         M: dateTime.getMonth() + 1,
//         d: dateTime.getDate(),
//         h: dateTime.getHours(),
//         m: dateTime.getMinutes(),
//         s: dateTime.getSeconds()
//     };
//     return format.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
//         return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-(v.length > 2 ? v.length : 2));
//     });
// }

async function post_event(user_id, type, image, summary){

    console.log('in post event!')
    const post_event_data = 'INSERT INTO event (user_id, type, image, summary, is_read) VALUES (?, ?, ?, ?, ?)';
    try{
        await queryPromise(post_event_data, [user_id, type, image, summary, 0]);
        return true;

    } catch (err) {
        console.error('Update error', err);
        return false;
    }
}



module.exports = {
    get_event,
    post_event,
    read_event,
    get_event_from_event_id
}