const User = require('../models/User')
const Token = require('../models/Token')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
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
  res.status(StatusCodes.CREATED).json({
    msg: 'Success, please verify in email',
    verificationToken: user.verificationToken,
  })
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
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError(
      'You need to verify with your email account'
    )
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
  const token = req.signedCookies.token
  res.cookie('token', 'logout', {
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

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
}
