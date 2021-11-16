import {io} from "socket.io-client";

const socket = io();

let uid: number = +$("#id").val();
let messages = document.getElementById('messages');
let connections = document.getElementById('connection');
let form = document.getElementById('form');
let input = document.getElementById('input') as HTMLInputElement;

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat_message', input.value);
        input.value = '';
    }
});
socket.on("connect", () => {
    console.log("connect client")
    socket.emit("ask_room", uid);
});

socket.on("join_room", async (room_name)=>{
    console.log(`player joined room : ${room_name}`)
})

socket.on('chat_message', function(msg) {
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

/*socket.on('private_message', (socketId,msg)=>{
    socket.to(socketId).emit(socket.id)
});*/
