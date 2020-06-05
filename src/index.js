require('dotenv').config()
const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { HOST, PORT } = process.env

const application = express()
const server = http.createServer(application)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, 'public')

application.use(express.static(publicDirectoryPath))

io.on('connection', socket => {
  console.log('New Socket Connection')

  // Send message for only person who connects
  socket.emit('message', 'Welcome')

  // Sends to everyone but the connected person who connects
  socket.broadcast.emit('message', 'A new user has joined!')

  socket.on('sendMessage', (message, delivered) => {
    // Emit for everyone connected
    io.emit('message', message)

    // Confirm to sender if message was delivered
    delivered('Delivered.')
    console.log(message, 'sent.')
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!')
  })
})

server.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`)
})
