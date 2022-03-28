import * as $ from "jquery";
import { io } from "socket.io-client";

const socket = io();
const play = $("#play");
const createGame = $("#createGame");
const uid = +($('#uid').text());
const parties = $("#parties");
const showParties = $('#show_parties');

let is_searching_room = false;

play.on("click", function (){
    is_searching_room = !is_searching_room;
    if (is_searching_room){
        socket.emit("ask_room", uid);
    }
});

createGame.on("click", function (){
    is_searching_room = !is_searching_room;
    if (is_searching_room){
        socket.emit("create_room", uid);
    }
});

parties.on("click", function (){
    socket.emit("show_room",uid)
});


socket.on("room_found", (roomId) => {

    if (is_searching_room)
        window.location.href = `/lobby/${roomId}`;
});
socket.on("room_showing",(party)=>{
    showParties.css({
        'display':'flex',
        'flex-direction':'column',
        'justify-content':'space-around'
    });
    party.forEach(function (arrayItem) {
        const x = arrayItem.id;
        const inPartyPlayers = arrayItem.players.length;
        const gameCapacity = arrayItem.nbJoueursMax;
        const value = `${x} ${inPartyPlayers}/${gameCapacity}`;
        const button= $('<input type="button" value="" class="games_list" style="margin-top: 5px; display: block"/>');
        button.attr("value",value);
        button.on("click", function (){
            window.location.href=`/lobby/${x}`;
        });
        showParties.append(button);
    });
});