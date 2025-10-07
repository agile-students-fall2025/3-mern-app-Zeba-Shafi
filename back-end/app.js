require('dotenv').config({ silent: true }) // load environmental variables from a hidden file named .env
const express = require('express') // CommonJS import style
const morgan = require('morgan') // middleware for nice logging of incoming HTTP requests
const cors = require('cors') // middleware for enabling CORS (Cross-Origin Resource Sharing) requests.
const mongoose = require('mongoose')
const path = require('path')

const app = express() // instantiate an Express object
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' })) // log all incoming requests, except when in unit test mode.  morgan has a few logging default styles - dev is a nice concise color-coded style
app.use(cors()) // allow cross-origin resource sharing

// serve static files (e.g. images) from the public folder
app.use('/public', express.static(__dirname + '/public'))

// use express's builtin body-parser middleware to parse any data included in a request
app.use(express.json()) // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })) // decode url-encoded incoming POST data

// connect to database
mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`)
  .then(data => console.log(`Connected to MongoDB`))
  .catch(err => console.error(`Failed to connect to MongoDB: ${err}`))

// load the dataabase models we want to deal with
const { Message } = require('./models/Message')
const { User } = require('./models/User')

//handle fetching all messages
app.get('/messages', async (req, res) => {
  // load all messages from database
  try {
    const messages = await Message.find({})
    res.json({
      messages: messages,
      status: 'all good',
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({
      error: err,
      status: 'failed to retrieve messages from the database',
    })
  }
})

//handle fetching a single message by its id
app.get('/messages/:messageId', async (req, res) => {
  // load all messages from database
  try {
    const messages = await Message.find({ _id: req.params.messageId })
    res.json({
      messages: messages,
      status: 'all good',
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({
      error: err,
      status: 'failed to retrieve messages from the database',
    })
  }
})
//handle logging out users
app.post('/messages/save', async (req, res) => {
  // try to save the message to the database
  try {
    const message = await Message.create({
      name: req.body.name,
      message: req.body.message,
    })
    return res.json({
      message: message, // return the message we just saved
      status: 'all good',
    })
  } catch (err) {
    console.error(err)
    return res.status(400).json({
      error: err,
      status: 'failed to save the message to the database',
    })
  }
})

// a route to return About Us page 
app.get('/about', (req, res) => {
  // static content for the About Us page. 
  const aboutContent = {
    title: 'About Us',
    paragraphs: [
        "Hi — I'm Zeba Shafi, I'm a NYU CAS student double majoring in biology and computer science. I'm currently enrolled in Agile Software Development & DevOps.", 
        "This is my first time working with React and Express, and I hope to improve my skills in both",
        "In my free time, I enjoy reading, sketching and exploring the city",
        "In particular I hope to create art that integrates my passion for visual art, biology and coding",
        "Upon graduation I hope to pursue a career as a computational epidemologist",
        "Thank you for reading my profile!",
    ],
    // image served from back-end root at /zeba-shafi-profile-photo.jpg
    imageUrl: '/zeba-shafi-profile-photo.jpg'
  }

  return res.json({ about: aboutContent, status: 'all good' })
})

// serve the profile photo if it's placed at back-end/zeba-shafi-profile-photo.jpg
app.get('/zeba-shafi-profile-photo.jpg', (req, res) => {
  const filePath = path.join(__dirname, 'zeba-shafi-profile-photo.jpg')
  return res.sendFile(filePath, err => {
    if (err) {
      console.error('Failed to send profile photo:', err)
      res.status(404).end()
    }
  })
})


module.exports = app 
