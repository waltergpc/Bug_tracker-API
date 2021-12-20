const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const { id } = req.params
  const user = await User.findOne({ _id: id }).select('-password')
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${id}`)
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
  const { email, name } = req.body

  let { image } = req.body
  if (!image) {
    image = undefined
  }
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please Provide email, name')
  }
  const user = await User.findOne({ _id: req.user.userId })
  if (!user) {
    throw new CustomError.NotFoundError('User with given id not found')
  }
  checkPermissions(req.user, user._id)
  user.email = email
  user.name = name
  user.team = team
  user.image = image
  await user.save()

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser, img: user.image })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      'Please provide old and new passwords'
    )
  }
  const user = await User.findOne({ _id: req.user.userId })
  const passwordCorrect = await user.comparePassword(oldPassword)
  if (!passwordCorrect) {
    throw new CustomError.UnauthenticatedError('Password does not match')
  }
  user.password = newPassword
  await user.save()
  res.status(StatusCodes.OK).json({ msg: 'Password change succesful' })
}

const assignTeam = async (req, res) => {
  const { toAssign, team } = req.body
  const user = await User.findOneAndUpdate(
    { _id: toAssign },
    { team },
    { new: true, runValidators: true }
  )
  res
    .status(StatusCodes.OK)
    .json({ msg: `User ${toAssign} has been assigned to team ${team}` })
}
module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  assignTeam,
}
