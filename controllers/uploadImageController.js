const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

const uploadImage = async (req, res) => {
  let { folder } = req.body
  if (!folder) {
    folder = 'default'
  }
  console.log(folder)

  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded')
  }
  if (!req.files.image.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please upload image file')
  }
  if (!req.files.image.size > 1024 * 1024 * 5) {
    throw new CustomError.BadRequestError('Please upload smaller image file')
  }
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    { use_fileName: true, folder: folder }
  )
  fs.unlinkSync(req.files.image.tempFilePath)

  res.status(StatusCodes.CREATED).json({ src: result.secure_url })
}

module.exports = { uploadImage }
