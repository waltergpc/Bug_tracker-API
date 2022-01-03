const Ticket = require('../models/Ticket')
const Comment = require('../models/Comment')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkTicketPermissions } = require('../utils')

const createTicket = async (req, res) => {
  console.log(req.body)
  req.body.createdBy = req.user.userId
  req.body.team = req.user.team
  const ticket = await Ticket.create(req.body)
  res.status(StatusCodes.OK).json({ ticket })
}

const getAllTickets = async (req, res) => {
  let tickets
  if (req.user.role === 'admin') {
    tickets = await Ticket.find({}).populate({
      path: 'createdBy',
      select: 'name',
    })
  } else {
    tickets = await Ticket.find({ team: req.user.team }).populate({
      path: 'createdBy',
      select: 'name',
    })
  }
  res.status(StatusCodes.OK).json({ tickets, count: tickets.length })
}

const getSingleTicket = async (req, res) => {
  const { id: ticketId } = req.params
  const ticket = await Ticket.findOne({ _id: ticketId })
    .populate({
      path: 'createdBy',
      select: 'name',
    })
    .populate({
      path: 'assignedTo',
      select: 'name',
    })

  if (!ticket) {
    throw new CustomError.NotFoundError(`No ticket with ${ticketId} id`)
  }
  const comments = await Comment.find({ ticket: ticketId }).populate({
    path: 'user',
    select: 'name',
  })
  res.status(StatusCodes.OK).json({ ticket, comments })
}

const updateTicket = async (req, res) => {
  const { id: ticketId } = req.params
  req.body.team = req.user.team
  const ticket = await Ticket.findOne({ _id: ticketId }, req.body, {
    new: true,
    runValidators: true,
  })
  checkTicketPermissions(req.user, ticket.createdBy)
  res.status(StatusCodes.OK).json({ ticket })
}

const deleteTicket = async (req, res) => {
  const { id: ticketId } = req.params
  const ticket = await Ticket.findOne({
    _id: ticketId,
    createdBy: req.user.userId,
  })
  if (!ticket) {
    throw new CustomError.NotFoundError(`No ticket with ${ticketId} id`)
  }
  await ticket.remove()
  res.status(StatusCodes.OK).json({ msg: 'Successful remove' })
}

const assignTicket = async (req, res) => {
  if (!req.user.role == ('admin' || 'leader')) {
    throw new CustomError.UnauthorizedError(
      'You do not have the permissions for assignment'
    )
  }
  const { assignedTo, id } = req.body
  if (!assignedTo) {
    throw new CustomError.BadRequestError('Please provide users to assign to')
  }
  const ticket = await Ticket.findOne({ _id: id })
  ticket.assignedTo = [...ticket.assignedTo, assignedTo]
  await ticket.save()
  res.status(StatusCodes.OK).json({ ticket })
}

const unAssignTicket = async (req, res) => {
  if (!req.user.role == ('admin' || 'leader')) {
    throw new CustomError.UnauthorizedError(
      'You do not have the permissions for assignment'
    )
  }
  console.log(req.body)
  const { deleted, id } = req.body
  if (!deleted) {
    throw new CustomError.BadRequestError('Please provide users to assign to')
  }
  const ticket = await Ticket.findOne({ _id: id })
  ticket.assignedTo = [
    ...ticket.assignedTo.filter((el) => el.toString() !== deleted),
  ]

  await ticket.save()
  res.status(StatusCodes.OK).json({ msg: 'User was unassigned' })
}

module.exports = {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  unAssignTicket,
}
