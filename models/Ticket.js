const mongoose = require('mongoose')

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide ticket title'],
      trim: true,
      maxlength: [100, 'Cannot exceed 100 charcaters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      trim: true,
      maxlength: [1000, 'Cannot exceed 1000 charcaters'],
    },
    priority: {
      type: String,
      required: [true, 'Please provide ticket title'],
      trim: true,
      enum: ['normal', 'urgent', 'low'],
      default: 'normal',
    },
    status: {
      type: String,
      required: [true, 'Please provide the ticket status'],
      enum: ['in progress', 'solved', 'new', 'pending', 'cancelled'],
    },
    title: {
      type: String,
      required: [true, 'Please provide ticket title'],
      trim: true,
      maxlength: [100, 'Cannot exceed 100 charcaters'],
    },
    image: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      enum: ['UX', 'API', 'Miscelleanous', 'Design'],
      default: 'UX',
    },
    team: {
      type: String,
      required: [true, 'Please provide a team'],
      enum: {
        values: ['none', 'Betos', 'Aslan', 'Jeronimos'],
        message: '{VALUE} is not supported',
      },
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Plase provide a user'],
    },
    assignedTo: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
)

TicketSchema.pre('remove', async function (next) {
  await this.model('Comment').deleteMany({ ticket: this._id })
})
module.exports = mongoose.model('Ticket', TicketSchema)
