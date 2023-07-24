var username;
var nickname;
var socket = io();
var messages;
var form;
var input;
var recipient;
var globalRoomID;

socket.on("check user", function (ncknm) {
  var divNickname = document.getElementById("div-nickname");
  if (ncknm) {
    nickname = ncknm;
    fetch("/chat")
      .then((response) => response.text())
      .then((htmlContent) => {
        document.body.innerHTML = htmlContent;
        setNickname(ncknm);
      })
      .catch((error) => {
        console.error("Error loading HTML file:", error);
      });
  } else {
    divNickname.style.display = "flex";
  }
});

socket.on("set user", function (nickname) {
  fetch("/chat")
    .then((response) => response.text())
    .then((htmlContent) => {
      document.body.innerHTML = htmlContent;
      setNickname(nickname);
    })
    .catch((error) => {
      console.error("Error loading HTML file:", error);
    });
});

socket.on("get online users", function (users) {
  var onlineUsers = document.getElementById("user-list");
  onlineUsers.innerHTML = "";
  users.forEach(function (user) {
    if (user.username == username) {
      return;
    }
    var listUser = document.createElement("li");
    listUser.className = "user-list-item";
    listUser.id = user.username;
    listUser.addEventListener("click", function () {
      handleClickUser(listUser.id);
    });
    listUser.innerHTML = user.nickname;
    onlineUsers.appendChild(listUser);
  });
});


socket.on("private message", function (message) {
  console.log("client", message);
  console.log("sender", message.sender);
  console.log("recipient", recipient);
  if (recipient == message.sender) {
    var item = document.createElement("li");
    item.className = "received";
    item.innerHTML = message.content;
    messages.appendChild(item);
  } else {
    var user = document.getElementById(message.sender);
    if (user) {
      user.style.backgroundColor = "green";
    }
  }
});

socket.on("get chats", function (chats) {
  if (chats.length > 0) {
    console.log("inside if");
    document.getElementById("messages").style.height = "inherit";
  }

  chats.forEach(function (chat) {
    var item = document.createElement("li");
    if (chat.from == username) {
      item.className = "sent";
    } else {
      item.className = "received";
    }
    item.innerHTML = chat.content;
    messages.appendChild(item);
  });
});

socket.on("create room", function (roomId) {
  loadRoomChat(roomId, true);
  recipient = roomId;
});

socket.on("room message", function (message) {
  if (message.roomId == globalRoomID) {
    var item = document.createElement("li");
    var from = message.from;
    item.className = "received";
    item.innerHTML = `<div id="from">${from}</div>
                      <p>${message.content}</p>`;
    messages.appendChild(item);
  }
});

socket.on("room not found", function () {
  alert("Room Not Found!");
  recipient = undefined;
  globalRoomID = undefined;
});

socket.on("room joined", function (roomId) {
  recipient = roomId;
  globalRoomID = roomId;
  loadRoomChat(roomId);
});

socket.on("someone joined", function (user) {
  if (user.roomId == globalRoomID && user.roomId == recipient) {
    var item = document.createElement("li");
    item.className = "room-message";
    item.innerHTML = `${user.nickname} joined`;
    messages.appendChild(item);
  }
});


function submitUsername() {
  usernameInput = document.getElementById("username");
  socket.emit("check user", usernameInput.value);
  username = usernameInput.value;
}

function setUser() {
  var nickname = document.getElementById("nickname");
  socket.emit("set user", username, nickname.value);
}

function setNickname(ncknm) {
  nickname = ncknm;
  var welcomeUser = document.getElementById("welcomeUser");
  welcomeUser.innerHTML = "welcome " + ncknm + "!";
  getOnlineUsers();
}

function getOnlineUsers() {
  socket.emit("get online users");
}

function handleClickUser(username) {
  recipient = username;
  var user = document.getElementById(username);
  if (user) {
    user.style.backgroundColor = "white";
    user.addEventListener("mouseover", function () {
      user.style.backgroundColor = "#f2f2f2";
    });
    user.addEventListener("mouseout", function () {
      user.style.backgroundColor = "white";
    });
  }
  loadChatBox();
}

function loadChatBox() {
  var chatBox = document.getElementById("chat-box");
  fetch("/chat-box")
    .then((response) => response.text())
    .then((htmlContent) => {
      chatBox.innerHTML = htmlContent;

      messages = document.getElementById("messages");
      form = document.getElementById("form");
      input = document.getElementById("input");

      loadMessages();
    })
    .catch((error) => {
      console.error("Error loading HTML file:", error);
    });
}

function sendMessage() {
  if (input.value) {
    var item = document.createElement("li");
    item.className = "sent";
    item.innerHTML = input.value;
    messages.appendChild(item);

    socket.emit("private message", { recipient, content: input.value });
    input.value = "";
  }
}

function loadMessages() {
  socket.emit("get chats", recipient);
}


function createRoom() {
  socket.emit("create room");
}

function loadRoomChat(roomId) {
  globalRoomID = roomId;
  var chatBox = document.getElementById("chat-box");
  fetch("/chat-box")
    .then((response) => response.text())
    .then((htmlContent) => {
      chatBox.innerHTML = htmlContent;

      messages = document.getElementById("messages");
      form = document.getElementById("form");
      input = document.getElementById("input");
      send = document.getElementById("send");
      send.onclick = sendMessageInRoom;
      messages.style.height = "inherit";

      var item = document.createElement("li");
      item.className = "room-message";
      item.innerHTML = `Room ID: ${globalRoomID}`;
      messages.appendChild(item);
    })
    .catch((error) => {
      console.error("Error loading HTML file:", error);
    });
}

function sendMessageInRoom() {
  if (input.value) {
    var item = document.createElement("li");
    item.className = "sent";
    item.innerHTML = input.value;
    messages.appendChild(item);

    socket.emit("room message", {
      from: nickname,
      roomId: globalRoomID,
      content: input.value,
    });
    input.value = "";
  }
}

function joinRoom() {
  var roomId = document.getElementById("roomId");
  if (roomId) {
    socket.emit("join room", roomId.value);
    roomId.value = "";
  }
}
