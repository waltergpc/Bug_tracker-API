const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provde a username'],
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email',
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

UserSchema.pre('save', async function () {
  const hashedPassword = await bcrypt.hash(this.password, 10)
  this.password = hashedPassword
})

UserSchema.methods.comparePassword = async function (providedPassword) {
  const isMatch = await bcrypt.compare(providedPassword, this.password)
  return isMatch
}
module.exports = mongoose.model('User', UserSchema)
