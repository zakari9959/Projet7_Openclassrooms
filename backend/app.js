const express = require('express')
const mongoose = require('mongoose')

const path = require('path')
const booksRoutes = require('./routes/books')
const userRoutes = require('./routes/user')

const app = express()
const memoryStorage = []

require('dotenv').config()
const MongoUserName = process.env.MONGO_USER_NAME
const MongoMdp = process.env.MONGO_MDP

mongoose
  .connect(
    `mongodb+srv://${MongoUserName}:${MongoMdp}@cluster0.oujdcbk.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(error))
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  res.setHeader('Vary', 'Origin')

  next()
})

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/books', booksRoutes)
app.use('/api/auth', userRoutes)

module.exports = { app, memoryStorage }
