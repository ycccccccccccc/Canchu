const { auth } = require('../../util/auth');
const { insert_post_controller, update_post_controller, like_controller, dislike_controller, insert_comment_controller, get_post, get_search_post_controller } = require('../controllers/controllers_post');

const express = require('express');
const router = express.Router();

router.post('/posts', auth, insert_post_controller);

router.put('/posts/:id', auth, update_post_controller);

router.post('/posts/:id/like', auth, like_controller);

router.delete('/posts/:id/like', auth, dislike_controller);

router.post('/posts/:id/comment', auth, insert_comment_controller);

router.get('/posts/search', auth, get_search_post_controller)

router.get('/posts/:id', auth, get_post)

module.exports = router;
