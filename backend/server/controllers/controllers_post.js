const { insert_post, update_post, check_post_user, get_post_and_comment, get_post_and_comment_limit_with_userId, get_post_and_comment_limit_without_userId } = require('../models/models_post');
const { get_info_from_token } = require('../../util/auth');
const { insert_like, delete_like } = require('../models/models_like');
const { insert_comment, get_comment } = require('../models/models_comment');
const { get_user_from_post_id } = require('../models/models_user');
const { post_event } = require('../models/models_event');

const get_post = async (req, res) => {
    try{
        console.log('get_post')
        const token_info = await get_info_from_token(req, res);
        const user_id = token_info.id;
        const post_id = parseInt(req.params.id);
        const result = await get_post_and_comment(user_id, post_id);
        const comment = await get_comment(post_id);
        
        if(result.length != 0){
            result[0]["comments"] = JSON.stringify(comment);
            const parsedComment = JSON.parse(result[0]["comments"]);
            result[0]["comments"] = parsedComment;
            return res.status(200).json({
                "data": {
                    post:result[0]
                }
            })
        }
        else{
            return res.status(400).json({
                'message': 'Get post error!'
            })
        }
    } catch (err) {
        return res.status(400).json({
            'message': 'Get post error!'
        })
    }
}

//context
const insert_post_controller = async (req, res) => {
    try{
        console.log('insert_post_controller')
        const token_info = await get_info_from_token(req, res);
        const user_id = token_info.id;
        const insert_post_result = await insert_post(user_id, req.body.context);
        if(insert_post_result != false){
            return res.status(200).json({
                data: {
                    post: {
                        id: insert_post_result
                    }
                }
            })
        }
        else{
            return res.status(400).json({
                'message': 'Insert error!'
            })
        }

    } catch(err) {
        return res.status(400).json({
            'message': 'Insert error!'
        })
    }
}

const update_post_controller =  async (req, res) => {
    try{
        console.log('update_post_controller')
        const token_info = await get_info_from_token(req, res)
        const user_id = token_info.id;
        const post_id = parseInt(req.params.id);
        const check_poster = await check_post_user(user_id, post_id);
        if(check_poster){
            const update_post_result = await update_post(post_id, req.body.context);
            if(update_post_result){
                return res.status(200).json({
                    data: {
                        post: {
                            id: post_id
                        }
                    }
                })
            }
            else{
                return res.status(400).json({
                    'message': 'Insert error!'
                })
            }
        }
        else{
            return res.status(400).json({
                'message': 'Check poster identity error!'
            })
        }
    } catch(err) {
        return res.status(400).json({
            'message': 'Insert error!'
        })
    }

}

const like_controller = async (req, res) => {
    try{
        console.log('like_controller')
        const token_info = await get_info_from_token(req, res)
        const user_id = token_info.id;
        const post_id = parseInt(req.params.id);
        // console.log(user_id, post_id)
        const like_result = await insert_like(post_id, user_id);
        if(like_result != false){
            return res.status(200).json({
                data: {
                    post: {
                        id: post_id
                    }
                }
            })
        }
        else{
            return res.status(400).json({
                'message': 'Insert like error!'
            })
        }

    } catch (err) {

    }
}

const dislike_controller = async (req, res) => {
    try {
        console.log('dislike_controller')
        const token_info = await get_info_from_token(req, res)
        const user_id = token_info.id;
        const post_id = parseInt(req.params.id);
        const dislike_result = await delete_like(post_id, user_id);
        if(dislike_result != false){
            return res.status(200).json({
                data: {
                    post: {
                        id: post_id
                    }
                }
            })
        }
        else{
            return res.status(400).json({
                'message': 'Cancel like error!'
            })
        }
    } catch (err) {
        return res.status(400).json({
            'message': 'Cancel like error!'
        })
    }
    
}

//content
const insert_comment_controller = async (req, res) => {
    console.log('insert_comment_controller')
    const token_info = await get_info_from_token(req, res)
    const user_id = token_info.id;
    const post_id = parseInt(req.params.id);
    try {
        const comment_id = await insert_comment(user_id, post_id, req.body.content);
        const poster = await get_user_from_post_id(post_id);
        const text = `${token_info.name} 在你的貼文下面留言了！`;
        if(!(poster)){
            return res.status(400).json({
                'message': 'Get poster error!'
            })
        }
        if(poster[0].id != user_id){
            const insert_event_result = await post_event(poster[0].id, 'comment', poster[0].picture, text);
            if(!(insert_event_result)){
                return res.status(400).json({
                    'message': 'Insert event error!'
                })
            }
        }

        if( comment_id != false){
            return res.status(200).json({
                data: {
                    post: {
                        id: post_id
                    },
                    comment: {
                        id: comment_id
                    }
                }
            })
        } else {
            return res.status(400).json({
                'message': 'Insert comment error!'
            })
        }
    } catch (err) {
        return res.status(400).json({
            'message': 'Insert comment error!'
        })
    }
}

const get_search_post_controller = async (req, res) => {
    
    try{
        console.log('get_search_post_controller');
        const token_info = await get_info_from_token(req, res)
        
        const token_user_id = token_info.id;  //使用者的Id
        const user_id = parseInt(req.query.user_id);  //想搜尋的Id
        let cursor = req.query.cursor;
        
        let jsonObject = '';
        console.log('cursor: ', cursor)
        if(cursor){
            console.log(cursor);
            // 将 Base64 字符串解码为 Buffer
            const buffer = Buffer.from(cursor, 'base64');
            const decodedString = buffer.toString('utf-8');
            jsonObject = JSON.parse(decodedString);
        }
        
        let result = {};
        const limit = parseInt(10);
        if(isNaN(user_id)){
            console.log('friend & user post');
            result = await get_post_and_comment_limit_without_userId(token_user_id, jsonObject.post_id, limit);
        }
        else{
            console.log('user_id != null');
            result = await get_post_and_comment_limit_with_userId(token_user_id, user_id, jsonObject.post_id, limit);
            // const ids = result.map(item => item.id);
            // ids.pop();
            // const cacheKey = `post_list_${user_id}`
            // const post_list = await get_cache(cacheKey);
            // console.log(typeof post_list, " ", post_list);
            // await set_cache(cacheKey, ids, 60 * 60);
        }

        console.log('out!!!!!')

        let base64String = '';
        if(result.length == (limit + 1)){
            const last_index = result.length - 1;
            const next_cursor = {
                'post_id': result[last_index].id
            }
            const jsonString = JSON.stringify(next_cursor);
            base64String = Buffer.from(jsonString).toString('base64');
            //刪掉第11篇
            result.pop();
        }
        else{
            console.log('have not next post')
            base64String = null;
        }

        return res.status(200).json({
            'data':{
                'posts': result,
                'next_cursor': base64String
            }
        })

    } catch (err) {
        return res.status(400).json({
            message: 'Get search posts erorr.'
        })
    }
}

module.exports = {
    get_post,
    insert_post_controller,
    update_post_controller,
    like_controller,
    dislike_controller,
    insert_comment_controller,
    get_search_post_controller
}