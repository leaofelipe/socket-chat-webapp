require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const { HOST, PORT } = process.env;

const application = express();
const server = http.createServer(application);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "public");

application.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Socket Connection");

  socket.on("join", (options, res) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return res(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    res();
  });

  socket.on("sendMessage", (message, delivered) => {
    const user = getUser(socket.id);
    // Emit for everyone connected
    io.to(user.room).emit("message", generateMessage(user.username, message));

    // Confirm to sender if message was delivered
    delivered("Delivered.");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
