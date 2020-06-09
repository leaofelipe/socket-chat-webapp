require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const { HOST, PORT } = process.env;

const application = express();
const server = http.createServer(application);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "public");

application.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Socket Connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", generateMessage("Welcome"));
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined!`));
  });

  socket.on("sendMessage", (message, delivered) => {
    // Emit for everyone connected
    io.to("bh").emit("message", generateMessage(message));

    // Confirm to sender if message was delivered
    delivered("Delivered.");
  });

  socket.on("disconnect", () => {
    io.to("bh").emit("message", generateMessage("A user has left!"));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
