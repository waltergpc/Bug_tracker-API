require('dotenv').config()
require('express-async-errors')
// express
const express = require('express')
const app = express()
// packages
const morgan = require('morgan')
//db
const connectDB = require('./db/connect')
//middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.use(morgan('tiny'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello world')
})

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
