const Ticket = require('../models/Ticket')
const Comment = require('../models/Comment')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

const createTicket = async (req, res) => {
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
  const ticket = await Ticket.findOne({ _id: ticketId }).populate({
    path: 'createdBy',
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
  const ticket = await Ticket.findOneAndUpdate({ _id: ticketId }, req.body, {
    new: true,
    runValidators: true,
  })
  res.status(StatusCodes.OK).json({ ticket })
}

const deleteTicket = async (req, res) => {
  const { id: ticketId } = req.params
  const ticket = await Ticket.findOne({ _id: ticketId })
  if (!ticket) {
    throw new CustomError.NotFoundError(`No ticket with ${ticketId} id`)
  }
  await ticket.remove()
  res.status(StatusCodes.OK).json({ msg: 'Successful remove' })
}

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded')
  }
  if (!req.files.image.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please upload image file')
  }
  if (!req.files.image.size > 1024 * 1024 * 5) {
    throw new CustomError.BadRequestError('Please upload smaller image file')
  }
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    { use_fileName: true, folder: 'ticket-media' }
  )
  fs.unlinkSync(req.files.image.tempFilePath)

  res.status(StatusCodes.CREATED).json({ src: result.secure_url })
}

module.exports = {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
  uploadImage,
}
