const Comment = require('../models/Comment')
const Ticket = require('../models/Ticket')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

const createComment = async (req, res) => {
  const { ticket: ticketId } = req.body
  const isTicketValid = await Ticket.findOne({ _id: ticketId })
  if (!isTicketValid) {
    throw new CustomError.NotFoundError(`No ticket with id ${ticketId}`)
  }
  req.body.ticket = ticketId
  req.body.user = req.user.userId
  const comment = await Comment.create(req.body)
  res.status(StatusCodes.CREATED).json({ comment })
}

const getAllComments = async (req, res) => {
  const comments = await Comment.find({})
  res.status(StatusCodes.OK).json({ comments })
}

const getSingleComment = async (req, res) => {
  const { id: commentId } = req.params
  const comment = await Comment.findOne({ _id: commentId })
    .populate({ path: 'user', select: 'name' })
    .populate({ path: 'ticket', select: 'title' })
  if (!comment) {
    throw new CustomError.NotFoundError('no Comment with given id')
  }
  res.status(StatusCodes.OK).json({ comment })
}

const updateComment = async (req, res) => {
  const { id: commentId } = req.params
  const { title, comment: commentUpdate } = req.body
  const comment = await Comment.findOne({ _id: commentId })
  if (!comment) {
    throw new CustomError.NotFoundError('No comment with given id')
  }
  checkPermissions(req.user, comment.user)
  comment.title = title
  comment.comment = commentUpdate
  await comment.save()
  res.status(StatusCodes.OK).json({ comment })
}

const deleteComment = async (req, res) => {
  const { id: commentId } = req.params
  const comment = await Comment.findOne({ _id: commentId })
  if (!comment) {
    throw new CustomError.NotFoundError('No comment with given id')
  }
  checkPermissions(req.user, comment.user)
  await comment.remove()
  res.status(StatusCodes.OK).json({ msg: 'Comment deleted' })
}

module.exports = {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
}
