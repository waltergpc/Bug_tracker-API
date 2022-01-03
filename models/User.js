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
    minlength: [8, 'Password should be at least 8 characters'],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'leader'],
    default: 'user',
  },
  team: {
    type: String,
    enum: {
      values: ['none', 'Betos', 'Aslan', 'Jeronimos'],
      message: '{VALUE} is not supported',
    },
    default: 'none',
  },
  image: {
    type: String,
    required: false,
    default:
      'https://res.cloudinary.com/dgsy6fc2b/image/upload/v1640841375/user-image/default-user_fquqlt.png',
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Date,
  },
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
})

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const hashedPassword = await bcrypt.hash(this.password, 10)
  this.password = hashedPassword
})

UserSchema.methods.comparePassword = async function (providedPassword) {
  const isMatch = await bcrypt.compare(providedPassword, this.password)
  return isMatch
}
module.exports = mongoose.model('User', UserSchema)
