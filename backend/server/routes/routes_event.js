const { auth } = require('../../util/auth');
const { get_event_controller, read_event_controller } = require('../controllers/controllers_event');

const express = require('express');
const router = express.Router();

router.get('/events/', auth, get_event_controller);
  
router.post('/events/:event_id/read', auth , read_event_controller);

module.exports = router;