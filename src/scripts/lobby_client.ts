import "../styles/lobby.css";
import {io} from "socket.io-client";
import {Chart, registerables} from 'chart.js';
import {Partie} from "../entity/Partie";
const socket = io();
Chart.register(...registerables);


// @ts-ignore
let uid = _id, game = _game;
// @ts-ignore
game.gameMaster = _gameMaster;
let roomName = `${game.id}`,
    players = game.players,
    dureeVote = $("select[name='config_duree_vote']"),
    vote_load = $("#vote_load"),
    nbPlayers = $("#nbPlayers"),
    maxPlayers = $("#maxPlayers"),
    messages = $('#messages'),
    sendMsg = $("#sendMessage"),
    input = $("#input"),
    users = $("#users"),
    fieldset = $("#fieldset"),
    change_max_players = $("#change_max_players"),
    visibility = $("#visibility"),
    bans = $("#joueursBan");

change_max_players.on("input", function () {
    if (uid !== game.gameMaster && !(fieldset[0] as HTMLFieldSetElement).disabled)
        return
        update_max_players();
});

function sendMessage() {
    if (input.val() && `${input.val()}`.trim() !== "") {
        socket.emit('chat_message', ...players.filter(u => u.id === uid), input.val(), roomName);
        input.val("");
    }
}

sendMsg.on("click", sendMessage);

$(document).on("keydown", function (e){
    if (e.code === "Enter" || e.code === "NumpadEnter")
        sendMessage();
    if (e.key === "Escape") {
        let outer = $('.fond_blanc');
        if (outer.length > 0){
            outer.addClass("disappear");
            setTimeout(function(){outer.remove();}, 1000);
        }
    }
});

visibility.on("change", function() {
    if (uid === game.gameMaster)
    socket.emit("private", roomName, (visibility[0] as HTMLInputElement).checked);
});

socket.on("private", bool => (visibility[0] as HTMLInputElement).checked = bool);

socket.on('chat_message', (user, msg) => {
    create_message(user, msg);
    messages.scrollTop(messages[0].scrollHeight);
});

socket.on("new_player", function (userId, sockId){
    //Si le joueur est déjà connecté et joue, il est renvoyé à l'accueil
    //(il joue avec le dernier appareil connecté
    if (uid === userId && sockId !== socket.id)
        window.location.replace("/?otherDevice=1");
})

socket.on("players", function (p){
    players = p;
    $("#nbPlayers").text(p.length);
    create_players(p);
})

socket.on("change_max_players", max_players => {
    maxPlayers.text(`${max_players}`);
    game.nbJoueursMax = max_players;
    change_max_players.val(max_players)
})

socket.on("duree_vote", (duree) => {
    game.dureeVote = duree;
    vote_charge(false);
    dureeVote.find("option").each((index, element)=>{
        if (+($(element).val()) === +game.dureeVote){
            (element as HTMLOptionElement).selected = true;
        }
    })
})

socket.on("start_game", () => {
    window.location.replace("/play/" + game.id)
})

socket.on("ban", (id, bans) => {
    if (id === game.gameMaster) return;
    sendMessageBan(id);
    if (id === uid) return location.replace("/?banned=1");
    addBans(bans);
});

socket.on("unban", function(player, bans) {
    sendUnbanMessage(player);
    addBans(bans);
})

document.body.onload = ()=>{
    document.title = `The Village - ${game.id}`;
    input[0].focus();
    nbPlayers.text(game.players.length);
    maxPlayers.text(game.nbJoueursMax);
    (visibility[0] as HTMLInputElement).checked = !game.publique;
    (change_max_players[0] as HTMLInputElement).value = game.nbJoueursMax;
    addBans(game.bans);
    socket.emit("new_guy", uid, roomName);
    create_players(players);
    $("#nbJoueursMin").text(Partie.nbJoueursMin);

    dureeVote.find("option").each((index, element)=>{
        if (+($(element).val()) === +game.dureeVote){
            (element as HTMLOptionElement).selected = true;
        }
    })
}

dureeVote.on("change", (element)=>{
    if (uid !== game.gameMaster)
        return;
    let val = $(element.target).val();
    if (!([30, 45, 60, 90, 120, 150].includes(+val)))
        return;
    vote_charge(true);
    socket.emit("duree_vote", `${game.id}`, +val)
})

$("#start").on("click", function () {
    if (uid === game.gameMaster)
        start_game();
})

function vote_charge(charge) {
    if (!charge)
        return vote_load.empty();
    vote_load.html(`<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`)
}

function start_game() {
    if (players.length >= Partie.nbJoueursMin)
        socket.emit("start_game", `${game.id}`);
    else
        alert("Vous n'êtes pas assez nombreux");
}

function create_message(user, msg) {
    let item = $('<li>');
    let name = $(`<span class="msg_pseudo">${user.pseudo}</span>`);
    name.on("click", function(){
        display_user_info(user);
    });
    item.append(name);
    item.append(` : ${msg}`);
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

function create_user_tag(p, index :number) {
    let div = $(`<div id="user_${index}">`);
    div.addClass("user");

    let html = `
        <div class="container"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=" "><div id="avatar_${index}" class="avatar"></div></div>
        <span class="pseudo">${p.pseudo}</span>
        <span class="level">Level ${p.niveau}</span>
    `;
    div.html(html);
    div.on('click', function () {
        if ($(".popup").length === 0)
            display_user_info(p);
    });
    return div;
}

function display_user_info(player) {
    let p = popup();
    let html = `<div id="text_popup">
        <span class="show_pseudo">${player.pseudo}</span>
        <span class="show_level">Niveau ${player.niveau}</span>
    `;
    html +=  (player.nbPartiesJouees > 0) ?
        `<canvas class="show_camembert"></canvas><p></p>` :
        `<span class="never_played">Ce joueur n'a encore jamais joué</span>`;
    html += '</div>';
    if (uid === game.gameMaster && player.id !== uid) {
        html += `
            <button id="ban" class="red_btn">Bannir</button>
        `;
    }
    p.text.html(html);
    $(document.body).append(p.div);
    let ban = $("#ban");
    ban.one("click", function() {
        socket.emit("ban", roomName, player.id);
    });
    if (player.nbPartiesJouees === 0)
        return;
    new Chart(($(".show_camembert").get(0) as HTMLCanvasElement).getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: ['Victoires','Défaites'],
            datasets: [{
                label: 'Victoires/Défaites',
                data: [player.nbPartiesGagnees, player.nbPartiesJouees - player.nbPartiesGagnees],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1
            }]
        },
    });
}

function popup() {
    let div = $("<div>");
    div.addClass("popup");
    let outer = $("<div>");
    outer.append(div);
    outer.addClass("fond_blanc");
    let close = $("<span>").addClass("close").text("✖");
    div.append(close);
    let text = $("<div>").addClass("innerPopup");
    div.append(text);
    close.on("click", function () {
        outer.addClass("disappear");
        setTimeout(function(){outer.remove();}, 1000);
    })
    div.on("click", function(e){
        e.stopPropagation();
    });
    outer.on("click", function () {
        outer.addClass("disappear");
        setTimeout(function(){outer.remove();}, 1000);
    });
    return {div: outer, text};
}

function update_max_players() {
    (change_max_players[0] as HTMLInputElement).min = `${Math.max(Partie.nbJoueursMin, game.players.length)}`;
    if (change_max_players.val() === game.nbJoueursMax) return;
    if (change_max_players.val() < Partie.nbJoueursMin || change_max_players.val() > 15) {
        (change_max_players[0] as HTMLInputElement).min = `${Math.max(Partie.nbJoueursMin, game.players.length)}`;
        (change_max_players[0] as HTMLInputElement).max = `15`;
        alert("Stop messing with this *(-_-)*");
        return;
    }
    socket.emit("change_max_players", game.id, change_max_players.val());
}

function sendMessageBan(id) {
    let user = players.filter(u => u.id === id)[0];
    let li = $("<li>");
    li.addClass("ban_message");
    li.text(`Info : ${user.pseudo} a été banni de la partie.`);
    messages.append(li)
}

function addBans(ban) {
    bans.html(`<summary>Joueurs bannis</summary>`);
    ban.forEach(b => {
        let div = $("<div>").addClass("banned_player");
        div.addClass("joueur_ban");
        let p = $("<p>");
        p.text(`${b.pseudo} `);
        div.append(p);
        let close = $("<span>").addClass("unban").text("✖");
        div.append(close);
        close.on("click", function() {

            socket.emit("unban", roomName, b);
        });
        bans.append(div);
    })
}

function sendUnbanMessage(player) {
    if (uid !== game.gameMaster) return;
    let li = $("<li>");
    li.addClass("unban_message");
    li.text(`Info : ${player.pseudo} n'est plus banni de la partie.`);
    messages.append(li)
}