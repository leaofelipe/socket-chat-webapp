require('dotenv').config()
const express = require('express')
const http = require('http')
const { HOST, PORT } = process.env

const application = express()

application.get('/', (request, response) => {
  response.send()
})

const server = http.createServer(application)
server.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`)
})
