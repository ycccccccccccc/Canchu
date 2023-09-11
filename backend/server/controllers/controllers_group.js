const { get_info_from_token } = require('../../util/auth');
const { post_group, get_group, del_group } = require('../models/models_group');
const { post_in_group, get_post_in_group } = require('../models/models_group_post');
const { post_member, get_member, get_member_pending, agree_member } = require('../models/models_member');

const post_group_controller = async (req, res) => {
    
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_name = req.body.name;
    
        if(!group_name){
            console.error('No group name!');
            return res.status(400).json({
                message: 'No group name!'
            })
        }
        const group_id = await post_group(user_id, group_name);
        const member_id = await post_member(group_id, user_id, 'creator');

        if(!member_id){
            return res.status(500).json({
                message: 'Insert member error!',
            });
        }

        return res.status(200).json({
            data: {
                group: {
                    id: group_id
                }
            }
        })
    } catch {
        return res.status(400).json({
            message: 'Insert group error!',
        });
    }
}

const del_group_controller = async (req, res) => {
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_id = parseInt(req.params.group_id);
        
        const get_result = await get_group(group_id);
    
        if(!group_id){
            return res.status(400).json({
                message: 'No group id!'
            })
        }
        
        if(get_result.length === 0 || get_result[0].user_id !== user_id){
            return res.status(400).json({
                message: "You are not group's creator!!"
            })
        }

        const del_result = await del_group(group_id);
        if(del_result){
            return res.status(200).json({
                data:{
                    group:{
                        id: group_id
                    }
                }
            })
        }
        return res.status(500).json({
            message: "Delete group erorr!!"
        })
    } catch (err) {
        return res.status(400).json({
            message: "Delete group erorr!!"
        })
    }
}

const join_group_controller = async (req, res) => {
    
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_id = parseInt(req.params.group_id);
    
        if(!group_id){
            return res.status(400).json({
                message: 'No group id!'
            })
        }
        const get_member_data = await get_member(group_id, user_id);
        //已經有紀錄 creator, request...
        if(get_member_data.length !== 0){
            return res.status(400).json({
                message: 'You have been in the group or requested!'
            })
        }

        const member_id = await post_member(group_id, user_id, 'request');
        if(!member_id){
            return res.status(400).json({
                message: 'Insert member error!',
            });
        }

        return res.status(200).json({
            data:{
                group:{
                    id: group_id
                }
            }
        })

    } catch (err) {
        return res.status(400).json({
            message: "Join group erorr!!"
        })
    }
}

const get_pending_controller = async (req, res) => {
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_id = parseInt(req.params.group_id);
    
        if(!group_id){
            return res.status(400).json({
                message: 'No group id!'
            })
        }

        const group_creator = await get_member(group_id, user_id);
        if(group_creator.length === 0 || group_creator[0].identity !== 'creator'){
            return res.status(400).json({
                message: "You are not group's creator!"
            })
        }
        

        const users_info = await get_member_pending(group_id);
        const users = [];
    
        for(var i=0; i<users_info.length; i++){
          const user = {
            "id": users_info[i].id,
            "name": users_info[0].name,
            "picture": users_info[0].picture,
            "status": 'pending'
          }
          users.push(user);
        }

        return res.status(200).json({
            data:{
                users: users
            }
        })

    } catch (err) {
        return res.status(400).json({
            message: "Get pending erorr!!"
        })
    }
}

const agree_member_controller = async (req, res) => {
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_id = parseInt(req.params.group_id);
        const apply_user_id = parseInt(req.params.user_id);
    
        if(!group_id || !apply_user_id){
            return res.status(400).json({
                message: 'No group id or user id!'
            })
        }

        const group_creator = await get_member(group_id, user_id);
        if(group_creator.length === 0 || group_creator[0].identity !== 'creator'){
            return res.status(400).json({
                message: "You are not group's creator!"
            })
        }
        
        const agree_result = await agree_member(group_id, apply_user_id);
        console.log(agree_result)
        if(agree_result.changedRows != 0){
            return res.status(200).json({
                data:{
                    user:{
                        id: apply_user_id
                    }
                }
            })
        }
        return res.status(400).json({
            message: "Agree erorr!!( no request )"
        })

    } catch (err) {
        return res.status(400).json({
            message: "Agree erorr!!"
        })
    }
}

const post_in_group_controller = async (req, res) => {
    
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_id = parseInt(req.params.group_id);
        const context = req.body.context;
    
        if(!group_id || !context){
            console.error('No group name!');
            return res.status(400).json({
                message: 'No group id or context!'
            })
        }

        const check_user = await get_member(group_id, user_id);
        if(check_user.length === 0 || check_user[0]['identity'] == 'request'){
            return res.status(400).json({
                message: 'You are not in the group!',
            });
        }
        
        const post_id = await post_in_group(group_id, user_id, context);
        
        return res.status(200).json({
            data: {
                group: {
                    id: group_id
                },
                user: {
                    id: user_id
                },
                post: {
                    id: post_id
                }
            }
        })
    } catch {
        return res.status(400).json({
            message: 'Insert group error!',
        });
    }
}

const get_post_in_group_controller = async (req, res) => {
    
    try{
        const user_info = await get_info_from_token(req, res);
        const user_id = user_info.id;
        const group_id = parseInt(req.params.group_id);
        
    
        if(!group_id){
            return res.status(400).json({
                message: 'No group id!'
            })
        }

        const check_user = await get_member(group_id, user_id);
        if(check_user.length === 0 || check_user[0]['identity'] == 'request'){
            return res.status(400).json({
                message: 'You are not in the group!',
            });
        }
        
        const posts_data = await get_post_in_group(group_id);
        let posts = [];
        posts_data.map(item => {
            item['is_like'] = false;
            posts.push(item);
        })
        
        return res.status(200).json({
            data: {
                posts: posts
            }
        })
    } catch {
        return res.status(400).json({
            message: 'Insert group error!',
        });
    }
}



module.exports = {
    post_group_controller,
    del_group_controller,
    join_group_controller,
    get_pending_controller,
    agree_member_controller,
    post_in_group_controller,
    get_post_in_group_controller
}