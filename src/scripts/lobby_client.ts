import "../styles/lobby.css"
import {io} from "socket.io-client";

const socket = io();

let uid: number = +$("#id").text();
let messages = $('#messages');
let pseudo = $('#pseudo').text();
let sendMsg = $("#sendMessage")
let input = $("#input");


let roomName = $('#roomName').text();


function sendMessage() {
    if (input.val() && `${input.val()}`.trim() !== "") {
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
    messages.scrollTop(messages[0].scrollHeight);
});

socket.on("new_player", function (id, sockId){
    //Si le joueur est déjà connecté et joue, il est renvoyé à l'accueil
    //(il joue avec le dernier appareil connecté
    if (uid === id && sockId !== socket.id)
        window.location.replace("/?otherDevice=1");
})

document.body.onload = ()=>{
    socket.emit("new_guy", uid, roomName)
}

function create_message(pseudo, msg) {
    let item = $('<li>');
    item.text(`${pseudo} : ${msg}`);
    messages.append(item);
}