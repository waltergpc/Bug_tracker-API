const CustomError = require('../errors')
const { isTokenValid } = require('../utils')

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid')
  }

  try {
    const { name, userId, role, team } = isTokenValid({ token })
    req.user = { name, userId, role, team }
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
