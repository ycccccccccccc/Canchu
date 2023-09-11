const { find_user_from_id_token, find_user_from_mail } = require('../models/models_user')
const { get_info_from_token } = require('../../util/auth')
const { get_friendship, get_friendship_from_id, get_requested, insert_friendship, update_friendship, delete_friendship, get_friend_list } = require('../models/models_friendship')
const { post_event } = require('../models/models_event')
const { del_cache } = require('../../util/cache');

const get_friend_controller = async (req, res) => {

  try {
    const token_info = await get_info_from_token(req, res)
    const id = token_info.id;
    console.log(id);
    const result = await get_friend_list(id);
    console.log(result);

    if(result.length == 0){
      return res.status(200).json({
        data:{
          users: result
        }
      })
    }

    const friends = [];
    result.map(row => {
      const friend = {
        id: row.id,
        name: row.name,
        picture: row.picture,
        friendship: {
          id: row.friendship_id,
          status: row.status
        }
      };
      friends.push(friend);
    })

    return res.status(200).json({
      data:{
        users: friends
      }
    });

  } catch (err) {
    res.status(400).json({
      message: 'Get friend list erorr.'
    });
  }

}

const friendship_request_controller = async (req, res) => {

    const token_info = await get_info_from_token(req, res)
    const email = token_info.email
    const name = token_info.name
    
    const user = await find_user_from_mail(email);
    const Sender_id = user[0].id;
    const Recipient_id = parseInt(req.params.user_id);
  
    if (Sender_id != Recipient_id){
      const friendship = await get_friendship(Sender_id, Recipient_id);
      if (friendship === false){
        return res.status(500).json({
          message: 'Check error',
        });
      }

      //Profile cache delete
      const result_del_sender_cache = await del_cache(`${Recipient_id}_profile_${Sender_id}`);
      const result_del_recipient_cache = await del_cache(`${Sender_id}_profile_${Recipient_id}`);
      if (!(result_del_sender_cache && result_del_recipient_cache)) {
        console.log(`刪除 key erorr: ${Sender_id}, ${Recipient_id}`);
      }
  
      //為空 => 雙方無交友紀錄
      if( friendship.length == 0){
          try{
            const result = await insert_friendship(Sender_id, Recipient_id, 'requested', req, res);
            if(result === false){
              return res.status(500).json({
                message: 'Insert friendship error.', err
              });
            }
            else{
              console.log(`${name} 想和你成為朋友`);
              const text = `${name} 想和你成為朋友`;
              const user = await find_user_from_id_token(Recipient_id, req, res);
              const post_result =  await post_event(Recipient_id, "friend_request", user[0].picture, text);
              if(post_result){
                return res.status(200).json({
                  message: 'Create friendship',
                  data: {
                      friendship:{
                        id: result[0].id
                      }
                  },
              });
              }
              else{
                return res.status(500).json({
                  message: 'Update error',
                });
              }
            }
  
          } catch (err) {
            return res.status(500).json({
              message: 'Insert event error.'
            });
          }
  
        } else if (friendship[0].status =='requested') {
          if(friendship[0].id_1 == Sender_id){
            return res.status(400).json({
              message: 'You have already sent a friend request.'
            });
          } else{
            // 實作上，應該為答應交友邀請
            return res.status(400).json({
              message: 'You should respond to the friend request.'
            });
          }
        } else {
          return res.status(400).json({
            message: 'You are already friends.'
          });
        }
  
    } else {
    res.status(400).json({
      message: 'Sending a friend request to yourself is not allowed.'
    });
    }
}

const pending_list_controller = async (req, res) => {

    const token_info = await get_info_from_token(req, res);
    const id = token_info.id;
  
    const requested_list = await get_requested(id);
    const users = [];
    
    for(var i=0; i<requested_list.length; i++){
    
      const friend_info = await find_user_from_id_token(requested_list[i].id_1, req, res)
      const user = {
        "id": requested_list[i]['id_1'],
        "name": friend_info[0].name,
        "picture": friend_info[0].picture,
        "friendship": {
          "id": requested_list[i]['id'],
          "status": "pending"
        }
      }
      users.push(user);
    }
    res.status(200).json({
      message: "Peding request list!",
      data: {
        users
      }
    });
  
}

const friendship_agree_controller = async (req, res) => {
    const user_info = await get_info_from_token(req, res);
    const user_id = user_info.id;
    const user_name = user_info.name;
    const friendship_id = parseInt(req.params.friendship_id);
    const friendship_info = await get_friendship_from_id(friendship_id);

    //Profile cache delete
    const result_del_user_cache = await del_cache(`${user_id}_profile_${user_id}`)
    const result_del_sender_cache = await del_cache(`${friendship_info[0].id_1}_profile_${friendship_info[0].id_2}`);
    const result_del_recipient_cache = await del_cache(`${friendship_info[0].id_2}_profile_${friendship_info[0].id_1}`);
    if (!(result_del_user_cache && result_del_sender_cache && result_del_recipient_cache)) {
      console.log(`刪除 key erorr: ${user_id}, ${friendship_info[0].id}`);
    }

    try{
      if(friendship_info[0].id_2 == user_id && friendship_info[0].status == 'requested'){
        const update_result = await update_friendship(req, res, friendship_info[0].id, 'friend')
        if(update_result){
          const text = `${user_name} 同意了你的交友邀請`;
          const serder = await find_user_from_id_token(user_id, req, res);
          const insert_event_result = await post_event(friendship_info[0].id_1, 'friend_agree', serder[0].picture, text);
          if(insert_event_result){
              return res.status(200).json({
                message: "Update your friendship!",
                friendship: {
                  id: friendship_info[0].id
                }
              });
          }
          else{
            return res.status(500).json({
              message: 'Insert event error.'
            });
          }
  
        }
        else{
          return res.status(500).json({
            message: 'Update error.',
          });
        }
      }
      else{
        //雙方不曾遞交交友邀請
        if(friendship_info.length == 0){
          res.status(400).json({
            message: 'No friend request sent yet.',
          });
        }
        //你已寄送交友邀請
        else if(friendship_info[0].id_1 == user_id){
          res.status(400).json({
            message: 'Waiting for response.',
          });
        }
        else{
          res.status(400).json({
            message: 'Update error.',
          });
        }
      }
    } catch (err){
      res.status(400).json({
        message: 'Update error.',
      });
    }
  
  
}

const friendship_delete_controller = async (req, res) => {
    const user_info = await get_info_from_token(req, res);
    const user_id = user_info.id;
    const friendship_id = req.params.friendship_id;
    const friendship_info = await get_friendship_from_id(friendship_id);

    //Profile cache delete
    const result_del_user_cache = await del_cache(`${user_id}_profile_${user_id}`)
    const result_del_sender_cache = await del_cache(`${friendship_info[0].id_1}_profile_${friendship_info[0].id_2}`);
    const result_del_recipient_cache = await del_cache(`${friendship_info[0].id_2}_profile_${friendship_info[0].id_1}`);
    if (!(result_del_user_cache && result_del_sender_cache && result_del_recipient_cache)) {
      console.log(`刪除 key erorr: ${user_id}, ${friendship_info[0].id}`);
    }
  
    try{
      if(friendship_info.length == 0){
        return res.status(400).json({
          message: 'No friend request sent yet.',
        });
      }  
      //刪除朋友關係（friendship）
      const delete_friendship_result = await delete_friendship(friendship_info[0].id);
      if(delete_friendship_result){
        return res.status(200).json({
          message: "Delete your friendship!",
          friendship: {
            id: friendship_info[0].id
          }
        });
      }
      else{
        return res.status(500).json({
          message: 'Delete error',
        });
      }
    } catch (err) {
      return res.status(400).json({
        message: 'Delete error.',
      });
    }
}


module.exports = {
  get_friend_controller,
  friendship_request_controller,
  pending_list_controller,
  friendship_agree_controller,
  friendship_delete_controller,

}