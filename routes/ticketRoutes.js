const express = require('express')
const router = express.Router()
const { authorizePermissions } = require('../middleware/authentication')
const {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
  uploadImage,
} = require('../controllers/ticketController')

router.route('/').post(createTicket).get(getAllTickets)
router.route('/uploadImage').post(uploadImage)
router
  .route('/:id')
  .get(getSingleTicket)
  .patch(updateTicket)
  .delete(deleteTicket)

module.exports = router
