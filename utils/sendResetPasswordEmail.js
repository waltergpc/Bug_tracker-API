const sendEmail = require('./sendEmail')

const sendResetPasswordEmail = async ({ name, email, verificationToken }) => {
  const message = `In order to reset your password please follow this link :  
  https://scarabio.netlify.app/reset-password?email=${email}&verificationToken=${verificationToken}`

  return sendEmail({
    to: email,
    subject: 'Reset Password email',
    text: `Hello ${name}! ${message}`,
    hmtl: `<h4> Hello ${name}</h4>
    ${message}`,
  })
}

module.exports = sendResetPasswordEmail
