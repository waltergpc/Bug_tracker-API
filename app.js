require('dotenv').config()
require('express-async-errors')
// express
const express = require('express')
const app = express()
// packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary').v2
//db
const connectDB = require('./db/connect')
//routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const ticketRouter = require('./routes/ticketRoutes')
const commentRouter = require('./routes/commentRoutes')
//middleware
const { authenticateUser } = require('./middleware/authentication')
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(cors())
app.use(fileUpload({ useTempFiles: true }))
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
})

app.get('/', (req, res) => {
  console.log(req.cookies)
  res.send('hello world')
})

app.get('/api/v1', (req, res) => {
  console.log(req.signedCookies)
  res.send('testing')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', authenticateUser, userRouter)
app.use('/api/v1/tickets', authenticateUser, ticketRouter)
app.use('/api/v1/comments', authenticateUser, commentRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`App is listening on port ${port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
