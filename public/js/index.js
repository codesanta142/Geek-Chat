const socket = io();
const roomName = document.querySelector("#room-name");
const users = document.querySelector("#users");
const roomNameDiv = document.querySelector(".room-name-container");
const userMap = new Map();
const CURRENT_USER = sessionStorage.getItem("current_user");
var room;
socket.on("roomJoined", (connectionObj) => {
  room = connectionObj.room;
  roomName.innerHTML = connectionObj.room;
  roomNameDiv.classList.remove("animate");
});
socket.on("message", (message) => {
  let userID = socket.id;
  outputMessage({ message, userID });
});

function outputMessage(msg) {
  var values = Object.values(msg);
  const div = document.createElement("div");
  div.setAttribute("id", values[0].id);
  if (values[0].userID === values[1]) {
    div.classList.add("author");
    div.innerHTML += `<button class="btn-danger" onclick="deleteMsg('${values[0].id}')"><span class="material-icons">
        delete
        </span></button>`;
    playSound('send')
  } else {
    div.classList.add("message");
    if (values[0].username === "GeekChat Bot") {
      playSound('bot')
    } else {
      playSound('recieve')
    }
  }
  if (values[0].username === "GeekChat Bot") {
    div.classList.add("bot");
    div.innerHTML += `<p class="meta">${values[0].username} <span>${moment(
      values[0].time
    ).format("h:mm a")}</span></p>
        <p class="text">
        ${values[0]["text"]}
        </p>`;
    playSound('bot')
  } else {
    div.innerHTML += `<p class="meta">${values[0].username} <span>${moment(
      values[0].time
    ).format("h:mm a")}</span></p>
        <p class="text">
        ${values[0].text}
        </p>`;
  }

  document.querySelector(".chat-messages").appendChild(div);
  scrollToBottom();
}

const form = document.getElementById("chat-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  let userID = socket.id;
  socket.emit("chatMessage", { msg, userID });

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
  scrollToBottom();
});

function scrollToBottom() {
  document.querySelector(".chat-messages").scrollTop =
    document.querySelector(".chat-messages").scrollHeight;
}

socket.on("userList", (userList) => {
  for (let { name, session_id } of userList) {
    userMap.set(session_id, name);
    let user = document.createElement("li");
    user.classList.add("fade-in");
    user.dataset.id = session_id;
    user.innerHTML = name;
    users.appendChild(user);
  }
});
socket.on("userJoined", ({ id, username }) => {
  userMap.set(id, username);
  const user = document.createElement("li");
  user.classList.add("fade-in");
  user.dataset.id = id;
  user.innerHTML = username;
  users.appendChild(user);
});

socket.on("userLeft", ({ id, username }) => {
  const user = document.querySelector(`[data-id="${id}"]`);
  if (user) user.classList.add("fade-out");
  setTimeout(() => {
    user.remove();
  }, 1500);
  userMap.delete(id, username);
});

socket.on("deleteMsgFromChat", (msgId) => {
  if (msgId == null || msgId == undefined) {
    return;
  }
  document.getElementById(msgId).remove();
});

function deleteMsg(info) {
  let [name, id] = info.split("_");
  if (name === CURRENT_USER) {
    socket.emit("deleteChatMsg", info);
  }
}

const beep1 = document.getElementById('beep1')
const beep2 = document.getElementById('beep2')
const beep3 = document.getElementById('beep3')
const playSound = (beep) => {
  if (beep === 'send') {
    console.log('beep1 send')
    return beep1.play();
  }
  if (beep === 'bot'){
    console.log('beep3 bot')
    return beep3.play();
  }
  console.log('beep2 recieve')
  return beep2.play();
}