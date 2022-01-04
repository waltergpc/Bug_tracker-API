const sendEmail = require('./sendEmail')

const sendVerificationEmail = async ({ name, email, verificationToken }) => {
  const message = `Please confirm email by clicking the following link :  
  https://scarabio.netlify.app/verify-account?email=${email}&verificationToken=${verificationToken}`

  return sendEmail({
    to: email,
    subject: 'Email confirmation',
    text: `Hello ${name}! ${message}`,
    hmtl: `<h4> Hello ${name}</h4>
    ${message}`,
  })
}

module.exports = sendVerificationEmail
