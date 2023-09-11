const { auth } = require('../../util/auth');
const multer = require('multer');
const { signup_controller, signin_controller, update_profile_controller, get_profile_controller, update_picture_controller, user_search_controller } = require('../controllers/controllers_user');

const express = require('express');
const router = express.Router();

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
    }
})

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1 * 1024 * 1024 // 1MB
    }
  });
  

router.post('/users/signup', signup_controller);
  
router.post('/users/signin', signin_controller);

router.get('/users/:id/profile', auth, get_profile_controller);

router.put('/users/profile', auth, update_profile_controller);

router.put('/users/picture', auth, upload.single('picture'), update_picture_controller)

router.get('/users/search', auth, user_search_controller)

module.exports = router;