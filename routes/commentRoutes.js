const express = require('express')
const router = express.Router()
const {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController')

router.route('/').post(createComment).get(getAllComments)

router
  .route('/:id')
  .get(getSingleComment)
  .patch(updateComment)
  .delete(deleteComment)

module.exports = router
