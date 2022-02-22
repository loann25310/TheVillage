import * as $ from "jquery"
import { io } from "socket.io-client";
import {color} from "chart.js/helpers";

import {Partie} from "../entity/Partie";


const socket = io();
const play = $("#play");
const createGame = $("#createGame");
let uid = +($('#uid').text());
const parties = $("#parties");
let showParties = $('#show_parties');
console.log(uid);


//let userid = +document.getElementById("userid").innerText; //jquery ne return rien
let is_searching_room = false;

play.on("click", function (){

    is_searching_room = !is_searching_room;
    if (is_searching_room){
        socket.emit("ask_room", uid);
    }

})
createGame.on("click", function (){
    is_searching_room = !is_searching_room;
    if (is_searching_room){

        socket.emit("create_room", uid);
    }

})
parties.click(function (){
    socket.emit("show_room",uid)
})


socket.on("room_found", (roomId) => {

    if (is_searching_room)
        window.location.href = `/lobby/${roomId}`;
})
socket.on("room_showing",(party)=>{
    console.log(party);
    showParties.css({
        'display':'block'
    })
    party.forEach(function (arrayItem) {
        var x = arrayItem.id;
        var inPartyPlayers = arrayItem.players.size - 1;
        var gameCapacity = arrayItem.nbJoueursMax;
        var value = "";
        console.log(arrayItem)
        console.log(x);
        console.log(inPartyPlayers);
        console.log(gameCapacity);
        value += x +  " " + inPartyPlayers;
        value += "/" + gameCapacity;
        var button= $('<input type="button" value="" class="bt" style="margin-top: 5px; display: block"/>');
        button.attr("value",value)
        button.attr("onclick",window.location.href=`/lobby/${x}`);
        showParties.append(button);
    });

})