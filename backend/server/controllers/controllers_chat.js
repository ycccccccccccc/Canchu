const { get_info_from_token } = require('../../util/auth');
const { insert_message, get_message } = require('../models/models_chat');

const post_message_controller = async (req, res) => {
    
    try{
        const user_info = await get_info_from_token(req, res);
        const sender_id = user_info.id;
        const recipient_id = parseInt(req.params.user_id);
        const message = req.body.message;

        if( !message ){
            return res.status(400).json({
                message: 'No message!',
            });
        }

        if( sender_id == recipient_id){
            return res.status(400).json({
                message: 'Can not sent message to yourself!',
            });
        }

        const message_id = await insert_message(sender_id, recipient_id, message);
        if(message_id){
            return res.status(200).json({
                data: {
                    message: {
                        id: message_id
                    }
                }
            });
        }
        else{
            return res.status(400).json({
                message: 'Insert message error!',
            });
        }
    } catch (err) {
        return res.status(400).json({
            message: 'Insert message error!',
        });
    }
}

const get_message_controller = async (req, res) => {
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const search_user_id = parseInt(req.params.user_id);
        let cursor = req.query.cursor;

        let jsonObject = '';
        if(cursor){
            // 将 Base64 字符串解码为 Buffer
            const buffer = Buffer.from(cursor, 'base64');
            const decodedString = buffer.toString('utf-8');
            jsonObject = JSON.parse(decodedString);
        }
        const limit = 10;
        const messages = await get_message(user_id, search_user_id, jsonObject.post_id, limit);

        let base64String = '';
        if(messages.length == (limit + 1)){
            const last_index = messages.length - 1;
            const next_cursor = {
                'post_id': messages[last_index].id
            }
            const jsonString = JSON.stringify(next_cursor);
            base64String = Buffer.from(jsonString).toString('base64');
            //刪掉第11篇
            messages.pop();
        }
        else{
            console.log('have not next post')
            base64String = null;
        }

        return res.status(200).json({
            data:{
                messages: messages,
                next_cursor: base64String
            }
        });

    } catch (err) {
        return res.status(400).json({
            message: 'Get message error!',
        });
    }
}



module.exports = {
    post_message_controller,
    get_message_controller
}