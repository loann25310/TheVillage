import * as $ from "jquery"
import { io } from "socket.io-client";


const socket = io();
const play = $("#play");
let uid = +($('#uid').text());
console.log(uid);


//let userid = +document.getElementById("userid").innerText; //jquery ne return rien
let is_searching_room = false;

play.on("click", function (){
    is_searching_room = !is_searching_room;
    if (is_searching_room)
        socket.emit("ask_room", uid);
})

socket.on("room_found", (roomId) => {
    if (is_searching_room)
        window.location.href = `/lobby/${roomId}`;
})