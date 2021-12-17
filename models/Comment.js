const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the ticket comment'],
      minlength: 4,
      maxlength: 30,
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a description for the ticket comment'],
      minlength: 4,
      maxlength: 200,
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    ticket: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ticket',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Comment', CommentSchema)
