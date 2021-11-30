import "../styles/lobby.css"
import {io} from "socket.io-client";
import {User} from "../entity/User";
const socket = io();

// @ts-ignore
let uid = _id, roomName = _roomId, players = _players;
let nbJoueurs = $("#nbJoueurs");
let messages = $('#messages');
let pseudo = $('#pseudo').text();
let sendMsg = $("#sendMessage")
let input = $("#input");
let users = $("#users");

function sendMessage() {
    if (input.val() && `${input.val()}`.trim() !== "") {
        socket.emit('chat_message', pseudo, input.val(), roomName);
        input.val("");
    }
}

document.addEventListener("keydown", (e)=>{
    if (e.code === "Enter" || e.code === "NumpadEnter")
        sendMessage();
});

sendMsg.on("click", sendMessage);

socket.on('chat_message', (pseudo, msg) => {
    create_message(pseudo, msg);
    messages.scrollTop(messages[0].scrollHeight);
});

socket.on("new_player", function (user, sockId){
    //Si le joueur est déjà connecté et joue, il est renvoyé à l'accueil
    //(il joue avec le dernier appareil connecté
    if (uid === user && sockId !== socket.id)
        window.location.replace("/?otherDevice=1");
})

socket.on("players", function (players){
    nbJoueurs.text(players.length);
    create_players(players);
})

document.body.onload = ()=>{
    socket.emit("new_guy", uid, roomName);
    create_players(players);
}

function create_message(pseudo, msg) {
    let item = $('<li>');
    item.text(`${pseudo} : ${msg}`);
    messages.append(item);
}

function create_players(players) {
    users.empty();
    for (let i = 0; i < players.length; i++) {
        users.append(create_user_tag(players[i], i));
        let avatar = $(`#avatar_${i}`);
        avatar.css("background-color", players[i].avatar);
    }
}

function create_user_tag(p :User, index :number) {
    let div = $(`<div id="user_${index}">`);
    div.addClass("user");

    let html = `
        <div class="container"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=" "><div id="avatar_${index}" class="avatar"></div></div>
        <span class="pseudo">${p.pseudo}</span>
        <span class="level">Level ${p.niveau}</span>
    `;
    div.html(html);
    return div;
}