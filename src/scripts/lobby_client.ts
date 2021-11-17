import {io} from "socket.io-client";

const socket = io();

let uid: number = +document.getElementById("id").innerText
let messages = document.getElementById('messages');
let connections = document.getElementById('connection');
let sendMsg = document.getElementById('sendMessage');
let input = document.getElementById('input') as HTMLInputElement;

function getRoomName(){
    return document.getElementById("roomName").innerText;
}

function sendMessage() {
    if (input.value) {
        socket.emit('chat_message', input.value, getRoomName());
        input.value = '';
    }
}
document.addEventListener("keydown", (e)=>{
    if (e.code === "Enter" || e.code === "NumpadEnter")
        sendMessage();
})
sendMsg.onclick = sendMessage;

socket.on("connect", () => {
    console.log("connect client");
    socket.emit("ask_room", uid);
});

socket.on("join_room", async (room_name)=>{
    console.log(`player joined room : ${room_name}`);
    document.getElementById("roomName").innerText = room_name;
    connections.innerText += ""
})

socket.on('chat_message', (msg) => {
    console.log(msg)
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});