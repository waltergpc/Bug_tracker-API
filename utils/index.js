const { attachCookiesToResponse, isTokenValid } = require('./jwt')
const createTokenUser = require('./createTokenUser')
const {
  checkPermissions,
  checkTicketPermissions,
} = require('./checkPermissions')
const sendVerificationEmail = require('./sendVerificationEmail')
const sendResetPasswordEmail = require('./sendResetPasswordEmail')

module.exports = {
  attachCookiesToResponse,
  isTokenValid,
  createTokenUser,
  checkPermissions,
  checkTicketPermissions,
  sendVerificationEmail,
  sendResetPasswordEmail,
}
