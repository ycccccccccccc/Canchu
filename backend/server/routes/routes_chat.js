const { auth } = require('../../util/auth');
const express = require('express');
const { post_message_controller, get_message_controller } = require('../controllers/controllers_chat');
const router = express.Router();

router.post('/chat/:user_id', auth, post_message_controller);

router.get('/chat/:user_id/messages', auth, get_message_controller)


module.exports = router;
