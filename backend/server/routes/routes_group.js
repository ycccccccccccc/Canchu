const { auth } = require('../../util/auth');
const express = require('express');
const { post_group_controller, del_group_controller, join_group_controller, get_pending_controller, agree_member_controller, post_in_group_controller, get_post_in_group_controller } = require('../controllers/controllers_group');
const router = express.Router();

router.post('/groups', auth, post_group_controller);

router.delete('/groups/:group_id', auth, del_group_controller);

router.post('/groups/:group_id/join', auth, join_group_controller);

router.get('/groups/:group_id/member/pending', auth, get_pending_controller);

router.post('/groups/:group_id/member/:user_id/agree', auth, agree_member_controller);

router.post('/groups/:group_id/post', auth, post_in_group_controller);

router.get('/groups/:group_id/posts', auth, get_post_in_group_controller);


module.exports = router;
