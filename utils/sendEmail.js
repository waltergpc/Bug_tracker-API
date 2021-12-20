const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail')

const sendEmail = async ({ to, subject, text, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to, // Change to your recipient
    from: 'wallydummy47@gmail.com', // Change to your verified sender
    subject,
    text,
    html,
  }

  return sgMail.send(msg)
}

module.exports = sendEmail
