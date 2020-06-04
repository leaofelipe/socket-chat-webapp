require('dotenv').config()
const path = require('path')
const express = require('express')
const http = require('http')
const { HOST, PORT } = process.env

const application = express()
const publicDirectoryPath = path.join(__dirname, 'public')

application.use(express.static(publicDirectoryPath))

const server = http.createServer(application)
server.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`)
})
