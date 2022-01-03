const User = require('../models/User')
const Token = require('../models/Token')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../utils')
const crypto = require('crypto')

const register = async (req, res) => {
  const { email, name, password } = req.body
  const emailExists = await User.findOne({ email })
  if (emailExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }
  const verificationToken = crypto.randomBytes(40).toString('hex')
  const user = await User.create({ name, email, password, verificationToken })
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  })
  const tokenUser = createTokenUser(user)
  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip
  const userToken = { refreshToken, ip, userAgent, user: user._id }
  const tempToken = await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refresh: refreshToken })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  const passwordCorrect = await user.comparePassword(password)
  if (!passwordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  const tokenUser = createTokenUser(user)
  //create refreshToken
  let refreshToken = ''
  //check for existing refreshToken
  const existingToken = await Token.findOne({ user: user._id })
  if (existingToken) {
    const { isValid } = existingToken
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }
    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refresh: refreshToken })
    return res.status(StatusCodes.OK).json({ user: tokenUser })
  }

  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip
  const userToken = { refreshToken, ip, userAgent, user: user._id }
  const tempToken = await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refresh: refreshToken })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId })
  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expiresIn: new Date(Date.now()),
  })
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expiresIn: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out' })
}

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification falied')
  }
  if (verificationToken !== user.verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification failed')
  }
  user.verificationToken = ''
  user.isVerified = true
  user.verified = Date.now()
  await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Email verified' })
}

const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new CustomError.BadRequestError('Please provide your email')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError.NotFoundError('No user with provided email')
  }
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex')
    // send email

    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      verificationToken: passwordToken,
    })
    const tenMinutes = 1000 * 60 * 10
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)
    user.passwordToken = passwordToken
    user.passwordTokenExpirationDate = passwordTokenExpirationDate
    await user.save()
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please Check email for reset password' })
}

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values')
  }
  const user = await User.findOne({ email })
  if (user) {
    const currentDate = new Date()
    if (user.passwordTokenExpirationDate < currentDate) {
      throw new CustomError.BadRequestError(
        'Token has expirated, please restart the process'
      )
    }

    if (
      user.passwordToken === token &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password
      user.passwordToken = null
      user.passwordTokenExpirationDate = null
      await user.save()
    }
  }
  res.status(StatusCodes.OK).json({ msg: 'Password changed' })
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
}
