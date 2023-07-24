const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const users = require("./userDb/users");
const messages = require("./userDb/messages");
const rooms = require("./userDb/rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/script.js", function (req, res) {
  res.sendFile(__dirname + "/views/script.js");
});

app.get("/socket.js", function (req, res) {
  res.sendFile(__dirname + "/views/socket.js");
});

app.get("/main.css", function (req, res) {
  res.sendFile(__dirname + "/views/main.css");
});

app.get("/chatScript.js", function (req, res) {
  res.sendFile(__dirname + "/views/chatScript.js");
});

app.get("/chat", function (req, res) {
  res.sendFile(__dirname + "/views/chat.html");
});

app.get("/chat-box", function (req, res) {
  res.sendFile(__dirname + "/views/chatBox.html");
});

server.listen("3000", function () {
  console.log("Listening on Port 3000");
});

io.on("connection", function (socket) {
  let username;
  let nickname;
  // console.log("a user connected!");

  socket.on("disconnect", function () {
    // console.log("user disconnected");
    if (username) {
      users.removeUser(username);
      let onlineUsers = users.getOnlineUsers();
      io.emit("get online users", onlineUsers);
    }
  });
  socket.on("check user", function (usrnm) {
    socket.emit("check user", users.checkUser(usrnm));
    var user = users.getUser(usrnm);
    if (user) {
      username = user.username;
      nickname = user.nickname;
      users.updateSocket(usrnm, socket);
      users.userOnline(username);
    }
  });

  socket.on("set user", function (usernm, nicknm) {
    let user = users.setUser(usernm, nicknm, socket);
    username = user.username;
    nickname = user.nickname;
    socket.emit("set user", nickname);
    users.userOnline(username);
  });

  socket.on("get online users", function () {
    let onlineUsers = users.getOnlineUsers();
    io.emit("get online users", onlineUsers);
  });

  socket.on("private message", function (message) {
    messages.sendMessage(username, message.recipient, message.content);
    let recipientSocket = users.getUser(message.recipient).socket;
    recipientSocket.emit("private message", {
      sender: username,
      content: message.content,
    });
  });

  socket.on("get chats", function (recipient) {
    socket.emit("get chats", messages.getChatsBetween(username, recipient));
  });

  socket.on("create room", function () {
    let roomId = rooms.createRoom();
    socket.join(roomId);
    socket.emit("create room", roomId);
  });

  socket.on("room message", function (message) {
    socket.to(message.roomId).emit("room message", message);
  });

  socket.on("join room", function (roomId) {
    if (rooms.exists(roomId)) {
      socket.join(roomId);
      socket.emit("room joined", roomId);
      socket.to(roomId).emit("someone joined", { roomId, nickname });
    } else {
      socket.emit("room not found");
    }
  });
});
