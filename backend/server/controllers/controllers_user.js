const fs = require('fs');
const { insert_user, find_user_from_mail, find_user_from_id, search_user, update_picture, update_user } = require('../models/models_user')
const { get_info_from_token } = require('../../util/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { count_friends, get_friendship } = require('../models/models_friendship');
const { get_cache, set_cache } = require('../../util/cache');

const signup_controller = async (req, res) => {

    try {
        //Can't exist spaces
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if(!(name && email && password)){
            return res.status(400).json({
                message: "Incomgti plete user's information!"
            });
          }
        
          const user = await find_user_from_mail(req.body.email);
          if(user !== false){
              if(user.length == 0){
                insert_user(req, res);
              }
              else{
                console.error('Email exists!');
                res.status(403).json({
                  message: 'Email exists!',
                });
              }
          }
          else{
              return res.status(403).json({
                  message: "Can not find user's info from email",
              });
          }
    } catch (err) {
        res.status(400).json({
            message: 'Input erorr'
        });
    }
}

const signin_controller = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!(email && password)){
        return res.status(400).json({
            message: "Incomplete user's information!"
        });
    }

    if(req.body.provider == null){
        return res.status(400).json({
        message: 'No provider!',
        });
    }
    if(req.body.provider != 'native' && req.body.provider != 'facebook'){
        return res.status(403).json({
        message: 'Wrong provider!',
        });
    }

    try{
        const user_info = await find_user_from_mail(req.body.email);
        if(user_info != false){
            if(user_info.length == 0){
                return res.status(403).json({
                    message: 'Email not exists!',
                });
            }
            else{
                const check = await bcrypt.compare(password, user_info[0]['password']);
                if (check) {
                const token = jwt.sign(
                    { 
                        id: user_info[0]['id'],          
                        name: user_info[0]['name'], 
                        email: req.body.email
                    }, process.env.SECRET, { expiresIn: '1 hour' });
        
                res.status(200).json({
                    message: "sign in success!",
                    data: {
                        access_token: token,
                        user:{
                            id: user_info[0]['id'],
                            provider: user_info[0]['provider'],
                            name: user_info[0]['name'],
                            email: user_info[0]['email'],
                            picture: user_info[0]['picture']
                        }
                    }
                });
                }
                else{
                return res.status(403).json({
                    message: "User name and password do not match.",
                })
                }
            }
        }
        else{
        return res.status(403).json({
          message: "Can not find user's info from email",
        });
        }        
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: err,
        });
    }
}

const get_profile_controller = async (req, res) => {
    console.log('Get Profile!');
    try{
        const token_info = await get_info_from_token(req, res)
        const token_user_id = token_info.id

        const cacheKey = `${token_user_id}_profile_${req.params.id}`;
        const cache_profile = await get_cache(cacheKey);
        if(cache_profile){
            return res.status(200).json({
                message: "Get cache profile!",
                data: cache_profile
            });
        }

        console.log('No cache profile')
        const user_info = await find_user_from_id(req, res);
        const count  = await count_friends(user_info[0]['id']);
        const friendship_data = await get_friendship(token_user_id, user_info[0]['id']);
        console.log(friendship_data)

        let friendship = {};

        if(friendship_data.length == 0){
            friendship = null;
        }
        else if(friendship_data[0].status == 'requested' && friendship_data[0].id_2 == token_user_id){
            friendship = {
                id: friendship_data[0].id,
                status: 'pending'
            }
        }
        else {
            friendship = {
                id: friendship_data[0].id,
                status: friendship_data[0].status
            }
        }
        console.log(friendship)

        const return_json = {
            user:{
                id: user_info[0]['id'],
                name: user_info[0]['name'],
                picture: user_info[0]['picture'],
                friend_count: count,
                introduction: user_info[0]['introduction'],
                tags: user_info[0]['tags'],
                friendship: friendship
        }}

        await set_cache(cacheKey, return_json, 60 * 60);

        res.status(200).json({
            message: "Get profile!",
            data: return_json
        });
    } catch (err) {
        res.status(400).json({
        message: "Can not find the user's info."
        })
    }
}

const update_profile_controller = async (req, res) => {
    console.log('Update Profile!')
    const token_info = await get_info_from_token(req, res)
    const email = token_info.email

    try{
        const user_info = await find_user_from_mail(email);
        const id = user_info[0].id
        const result = await update_user(req.body.introduction, req.body.tags, id)
        
        const cacheKey = `${id}_profile_${id}`;
        const cache_profile = await get_cache(cacheKey);
        if(cache_profile){
            let proflie = cache_profile;
            proflie['user']['introduction'] = req.body.introduction;
            proflie['user']['tags'] = req.body.tags;
            await set_cache(cacheKey, proflie, 60 * 60);
        }

        if(result !== false){
            return res.status(200).json({
                message: "Update your profile!",
                data: {
                    user:{
                        id: id
                    }
                }
            });
        }
        else{
            return res.status(400).json({
                message: "Update your profile erorr!!"
            });
        }

    } catch (err) {
        return res.status(400).json({
            message: "Can not find the user's info."
        })
    }
}

const update_picture_controller = async (req, res) => {
    console.log('Update Picture!')
    const token_info = await get_info_from_token(req, res);
    const id = token_info.id;
  
    try{
  
        const image = req.file;
        if(!image){
            console.log('image is empty')
            return res.status(400).json({
                message: 'No image provided.'
            })
        }

        const file_name = (req.file.originalname).split('.');
        fs.rename(`public/images/${req.file.originalname}`, `public/images/user_${id}.${file_name[file_name.length-1]}`, (err) => {
            if (err) {
              console.error('重命名文件失敗:', err);
            } else {
              console.log('文件重命名成功！');
            }
        });

        const pic_path = `https://13.236.235.254/images/user_${id}.${file_name[file_name.length-1]}`;
        
        //Cache
        const cacheKey = `${id}_profile_${id}`;
        const cache_profile = await get_cache(cacheKey);
        if(cache_profile){
            let proflie = cache_profile;
            proflie['user']['picture'] = pic_path;
            await set_cache(cacheKey, proflie, 60 * 60);
        }
        
        const update_picture_result = await update_picture(id, pic_path);
        if(update_picture_result != false){
          return res.status(200).json({
          message: "Update your profile's picture!",
          data: {
              picture: pic_path
          }
          });
        }
        else{
          return res.status(400).json({
            message: "Update picture path error."
          })
        }
    } catch (err) {
        res.status(400).json({
          message: "Can not find the user's info."
        })
    }
}

const user_search_controller = async (req, res) => {
    const token_info = await get_info_from_token(req, res)
    const user_id = token_info.id;
    const search_name = req.query.keyword;

    if(search_name == null){
        return res.status(400).json({
        message: 'Search name empty!'
        })
    }
    try{
        const users  = await search_user(user_id, search_name);
        if(users === false){
            return res.status(400).json({
                message: 'Search name error!'
            })
        } else {
            return res.status(200).json({
                data: {"users": users}
            })
        }
    } catch (err) {
        return res.status(500).json({
        message: "Can not find the user's info."
        })
    }
}


  module.exports = {
    signup_controller,
    signin_controller,
    get_profile_controller,
    update_profile_controller,
    update_picture_controller,
    user_search_controller,
  }