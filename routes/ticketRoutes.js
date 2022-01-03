const express = require('express')
const router = express.Router()
const { authorizePermissions } = require('../middleware/authentication')
const {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  unAssignTicket,
} = require('../controllers/ticketController')
const { uploadImage } = require('../controllers/uploadImageController')

router.route('/').post(createTicket).get(getAllTickets)
router.route('/uploadImage').post(uploadImage)
router.route('/assign-ticket').patch(assignTicket)
router.route('/unassign-ticket').patch(unAssignTicket)
router
  .route('/:id')
  .get(getSingleTicket)
  .patch(updateTicket)
  .delete(deleteTicket)

module.exports = router
