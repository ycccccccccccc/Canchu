const { auth } = require('../../util/auth')
const { friendship_request_controller, pending_list_controller, friendship_agree_controller, friendship_delete_controller, get_friend_controller } = require('../controllers/controllers_friendship');

const express = require('express');
const router = express.Router();

router.get('/friends', auth, get_friend_controller)

router.post('/friends/:user_id/request', auth, friendship_request_controller)

router.get('/friends/pending', auth, pending_list_controller)

router.post('/friends/:friendship_id/agree', auth, friendship_agree_controller)

router.delete('/friends/:friendship_id', auth, friendship_delete_controller)

module.exports = router;