import * as $ from "jquery"
import { io } from "socket.io-client";


const socket = io();
const play = $("#findRoom");
const userid = $("#userid").val();
let is_searching_room = false;

play.on("click", function (){
    socket.emit(is_searching_room ? "cancel_search_room" : "ask_room", userid);
    is_searching_room = !is_searching_room;
})
