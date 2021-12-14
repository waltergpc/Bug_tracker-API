const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const jwt = require('jsonwebtoken')
const { createJWT } = require('../utils')

const register = async (req, res) => {
  const { email, name, password } = req.body
  const emailExists = await User.findOne({ email })
  if (emailExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }
  const role = 'user'
  const user = await User.create({ name, email, password, role })
  const tokenUser = { name: user.name, id: user._id, role: user.role }
  const token = createJWT({ payload: tokenUser })
  res.status(StatusCodes.CREATED).json({ user: tokenUser, token })
}

const login = async (req, res) => {
  res.send('login')
}

const logout = async (req, res) => {
  res.send('logout')
}

module.exports = {
  register,
  login,
  logout,
}
