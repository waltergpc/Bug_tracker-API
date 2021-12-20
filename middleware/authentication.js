const CustomError = require('../errors')
const { isTokenValid, attachCookiesToResponse } = require('../utils')
const Token = require('../models/Token')

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies
  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken)
      req.user = {
        name: payload.name,
        userId: payload.userId,
        role: payload.role,
        team: payload.team,
        image: payload.image,
      }
      return next()
    }
    const payload = isTokenValid(refreshToken)
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refresh,
    })
    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication invalid')
    }
    attachCookiesToResponse({
      res,
      user: payload.user,
      refresh: existingToken.refreshToken,
    })
    req.user = payload.user
    next()
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid')
  }
}

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError('You do not have the permissions')
    }
    next()
  }
}

module.exports = { authenticateUser, authorizePermissions }
