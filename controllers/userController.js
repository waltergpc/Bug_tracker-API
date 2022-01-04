const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  let users
  if (req.user.role === 'admin') {
    users = await User.find({}).select('-password')
  } else {
    users = await User.find({ team: req.user.team }).select(
      '-password -isVerified'
    )
  }

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
  const { email, name, image } = req.body
  console.log(req.body)

  if (!email || !name) {
    throw new CustomError.BadRequestError('Please Provide email, name')
  }
  const user = await User.findOne({ _id: req.user.userId })
  if (!user) {
    throw new CustomError.NotFoundError('User with given id not found')
  }
  if (user.email === 'demouser@demouser.com') {
    throw new CustomError.UnauthorizedError('Demo user cannot be modified')
  }
  checkPermissions(req.user, user._id)
  if (!image) {
    user.email = email
    user.name = name
  }
  if (image) {
    user.image = image.src
  }
  await user.save()

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
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
    throw new CustomError.UnauthenticatedError(' Old Password does not match')
  }
  user.password = newPassword
  await user.save()
  res.status(StatusCodes.OK).json({ msg: 'Password change succesful' })
}

const assignTeam = async (req, res) => {
  const { toAssign, team } = req.body
  console.log(req.body)
  await User.findOneAndUpdate(
    { _id: toAssign },
    { team: team },
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
