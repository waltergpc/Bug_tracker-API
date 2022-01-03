const express = require('express')
const { uploadImage } = require('../controllers/uploadImageController')
const router = express.Router()
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  assignTeam,
} = require('../controllers/userController')
const { authorizePermissions } = require('../middleware/authentication')

// Routes

router
  .route('/')
  .get(authorizePermissions('admin', 'leader', 'user'), getAllUsers)

router.route('/showMe').get(showCurrentUser)

router.route('/updateUser').patch(updateUser)

router.route('/updateUserPassword').patch(updateUserPassword)

router.route('/uploadimage').post(uploadImage)

router.route('/assignteam').patch(authorizePermissions('admin'), assignTeam)

router.route('/:id').get(getSingleUser)

module.exports = router
