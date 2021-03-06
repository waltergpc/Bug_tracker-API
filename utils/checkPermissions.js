const CustomError = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return
  if (requestUser.userId === resourceUserId.toString()) return
  throw new CustomError.UnauthorizedError('Unauthorizaed resource')
}

const checkTicketPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin' || 'leader') return
  if (requestUser.userId === resourceUserId.toString()) return
  throw new CustomError.UnauthorizedError('Unauthorizaed resource')
}

module.exports = { checkPermissions, checkTicketPermissions }
