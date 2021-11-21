import {io} from "socket.io-client";

const socket = io();

let uid: number = +$("#id").text();
let messages = document.getElementById('messages');
let pseudo = $('#pseudo').text();
let sendMsg = $("#sendMessage")
let input = $("#input");


let roomName = document.getElementById("roomName").innerText;


function sendMessage() {
    if (input.val()) {
        socket.emit('chat_message', pseudo, input.val(), roomName);
        input.val("");
    }
}
document.addEventListener("keydown", (e)=>{
    if (e.code === "Enter" || e.code === "NumpadEnter")
        sendMessage();
})
sendMsg.on("click", sendMessage)

socket.on('chat_message', (pseudo, msg) => {
    create_message(pseudo, msg);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on("new_player", function (id, sockId){
    //Si le joueur est déjà connecté et joue, il est déconnecté
    if (uid === id && sockId !== socket.id)
        window.location.replace("/?otherDevice=1");
})

document.body.onload = ()=>{
    socket.emit("new_guy", uid, roomName)
}

function create_message(pseudo, msg) {
    let item = document.createElement('li');
    item.textContent = `${pseudo} : ${msg}`;
    messages.appendChild(item);
}