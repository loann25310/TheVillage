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

socket.on('chat_message', (msg) => {
    console.log("Message reçu : " + msg)
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on("new_player", function (id, sockId){
    console.log("mama mia")
    if (uid === id && sockId !== socket.id)
        window.location.replace("/?fdp=1");
})

document.body.onload = ()=>{
    console.log('trolololololol')
    socket.emit("new_guy", uid, getRoomName())
}