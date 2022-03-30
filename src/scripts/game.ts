import * as $ from 'jquery';
import "../styles/vote.css";
import "../styles/task.css";
import "../styles/history.css";
import {Player} from "../entity/Displayables/Props/Player";
import {Environment} from "../entity/Environment";
import {PlayerMove} from "../entity/types/PlayerMove";
import {io} from "socket.io-client";
import {Partie} from "../entity/Partie";
import {User, UserColor} from "../entity/User";
import {Coordinate} from "../entity/types/Coordinate";
import {Villageois} from "../entity/roles/Villageois";
import {Map} from "../entity/Map";
import {Roles} from "../entity/types/Roles";
import {Chasseur} from "../entity/roles/Chasseur";
import {Sorciere} from "../entity/roles/Sorciere";
import {Voyante} from "../entity/roles/Voyante";
import {LoupGarou} from "../entity/roles/LoupGarou";
import {HUD} from "../entity/Displayables/HUD";
import {Blood} from "../entity/Displayables/Props/Blood";
import {Box} from "../entity/Displayables/Props/Box";
import { Bush } from '../entity/Displayables/Props/Bush';
import {Fork} from "../entity/Displayables/Props/Fork";
import {House} from "../entity/Displayables/Props/House";
import {PineTree} from "../entity/Displayables/Props/PineTree";
import {Tree} from "../entity/Displayables/Props/Tree";
import {TreeStump} from "../entity/Displayables/Props/TreeStump";
import {serializeUser} from "passport";

// @ts-ignore
const partie = _partie as Partie;
// @ts-ignore
const user = _user as User;
// @ts-ignore
const map = _map as Map;
//@ts-ignore
const role = _role as Roles;
//@ts-ignore
const numeroJoueur = _numeroJoueur as number;
//@ts-ignore
const LG = _LG as number[];

const socket = io(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`);

// @ts-ignore
let game = _game, players = _players;
let last_ms;

let roomName = `${game.id}`,
    messages = $('#messages'),
    sendMsg = $("#sendMessage"),
    input = $("#input"),
    listeJoueurs = $("#players");

const OTHER_PLAYERS: Player[] = [];

function getPlayerById(id: number): Player {
    for (const player of OTHER_PLAYERS)
        if(player.pid === id)
            return player;
    return null;
}

socket.on("error", (data) => {
    alert("Error: " + data.message);
});

let environment: Environment = new Environment();
let canvas = $('#mainCanvas')[0] as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

for (let p of players) {
    p.imgL1 = document.createElement("img");
    p.imgL1.src = "/img/Bonhomme-2/Bonhomme2-"+p.color+"-L.png";
    p.imgR1 = document.createElement("img");
    p.imgR1.src = "/img/Bonhomme-2/Bonhomme2-"+p.color+".png";
    p.imgL2 = document.createElement("img");
    p.imgL2.src = "/img/Bonhomme-1/Bonhomme1-"+p.color+"-L.png";
    p.imgR2 = document.createElement("img");
    p.imgR2.src = "/img/Bonhomme-1/Bonhomme1-"+p.color+".png";
    p.imgL3 = document.createElement("img");
    p.imgL3.src = "/img/Bonhomme-3/Bonhomme3-"+p.color+"-L.png";
    p.imgR3 = document.createElement("img");
    p.imgR3.src = "/img/Bonhomme-3/Bonhomme3-"+p.color+".png";
}

Player.deadimgL1 = document.createElement("img");
Player.deadimgL1.src = `/img/dead2L.png`;
Player.deadimgR1 = document.createElement("img");
Player.deadimgR1.src = `/img/dead2R.png`;
Player.deadimgL2 = document.createElement("img");
Player.deadimgL2.src = `/img/dead1L.png`;
Player.deadimgR2 = document.createElement("img");
Player.deadimgR2.src = `/img/dead1R.png`;
Player.deadimgL3 = document.createElement("img");
Player.deadimgL3.src = `/img/dead3L.png`;
Player.deadimgR3 = document.createElement("img");
Player.deadimgR3.src = `/img/dead3R.png`;
Player.deadimgL4 = document.createElement("img");
Player.deadimgL4.src = `/img/dead4L.png`;
Player.deadimgR4 = document.createElement("img");
Player.deadimgR4.src = `/img/dead4R.png`;
Blood.img = document.createElement("img");
Blood.img.src = `/img/blood.png`;
Box.image = document.createElement("img");
Box.image.src = "/img/box.png";
Bush.image = document.createElement("img");
Bush.image.src = "/img/buisson.png";
Fork.image = document.createElement("img");
Fork.image.src = "/img/fourche.png";
House.image = document.createElement("img");
House.image.src = "/img/maison.png";
PineTree.image = document.createElement("img");
PineTree.image.src = "/img/sapin.png";
Tree.image = document.createElement("img");
Tree.image.src = "/img/arbre.png";
TreeStump.image = document.createElement("img");
TreeStump.image.src = "/img/tree_stump.png";
let ghostimg = document.createElement("img");
ghostimg.src = `/img/fantome.png`;

let player: Player;
switch (role) {
    case Roles.Chasseur :
        player = new Chasseur(ctx, environment, {
            x: map.players_spawn[numeroJoueur].x,
            y: map.players_spawn[numeroJoueur].y
        }, Player.defaultSize, map, numeroJoueur);
        break;
    case Roles.Sorciere:
        player = new Sorciere(ctx, environment, {
            x: map.players_spawn[numeroJoueur].x,
            y: map.players_spawn[numeroJoueur].y
        }, Player.defaultSize, map, numeroJoueur);
        break;
    case Roles.Voyante:
        player = new Voyante(ctx, environment, {
            x: map.players_spawn[numeroJoueur].x,
            y: map.players_spawn[numeroJoueur].y
        }, Player.defaultSize, map, numeroJoueur);
        break;
    case Roles.LoupGarou:
        player = new LoupGarou(ctx, environment, {
            x: map.players_spawn[numeroJoueur].x,
            y: map.players_spawn[numeroJoueur].y
        }, Player.defaultSize, map, numeroJoueur);
        break;
    default:
        player = new Villageois(ctx, environment, {
            x: map.players_spawn[numeroJoueur].x,
            y: map.players_spawn[numeroJoueur].y
        }, Player.defaultSize, map, numeroJoueur);
        break;
}
player.pid = user.id;
player.setCord({
    x : -(canvas.width-Player.defaultSize.w) / 2,
    y : -(canvas.height-Player.defaultSize.h) / 2
});
player.color = user.color;

player.imgL1 = document.createElement("img");
player.imgL1.src = "/img/Bonhomme-2/Bonhomme2-"+user.color+"-L.png";
player.imgR1 = document.createElement("img");
player.imgR1.src = "/img/Bonhomme-2/Bonhomme2-"+user.color+".png";
player.imgL2 = document.createElement("img");
player.imgL2.src = "/img/Bonhomme-1/Bonhomme1-"+user.color+"-L.png";
player.imgR2 = document.createElement("img");
player.imgR2.src = "/img/Bonhomme-1/Bonhomme1-"+user.color+".png";
player.imgL3 = document.createElement("img");
player.imgL3.src = "/img/Bonhomme-3/Bonhomme3-"+user.color+"-L.png";
player.imgR3 = document.createElement("img");
player.imgR3.src = "/img/Bonhomme-3/Bonhomme3-"+user.color+".png";
player.image = player.getImg.next().value as HTMLImageElement;

const player_hud = new HUD({canvas, player});

let night = true;
let voteDisponible = false;

async function init(){

    if(map)
        await environment.create(ctx, map);
    else
        await environment.create(ctx);
    environment.move({x: -canvas.width / 2, y : -canvas.height / 2});
    environment.setCord({x: canvas.width / 2 - map.players_spawn[numeroJoueur].x, y : canvas.height / 2 - map.players_spawn[numeroJoueur].y});


    const blood = environment.possibleInteractions.filter(role === Roles.LoupGarou ? (o => o.name !== "blood") : (o => o.name === "blood"));
    for (const o of blood) {
        environment.possibleInteractions.splice(environment.possibleInteractions.indexOf(o), 1);
    }

    environment.initNight();
    socket.emit("get_tasks", player.pid);

    // Init HUD in environment
    environment.addToLayer(150, player_hud);

    function addRemotePlayer(data: {id: number, position: Coordinate, index: number, color: UserColor}): Player {
        let remotePlayer = new Villageois(ctx, environment, data.position, Player.defaultSize, map, data.index);
        remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
        remotePlayer.pid = data.id;
        remotePlayer.color = data.color;
        OTHER_PLAYERS.push(remotePlayer);
        player.addOtherPlayer(remotePlayer);
        environment.addToLayer(100, remotePlayer);
        remotePlayer.role = LG.includes(remotePlayer.pid) ? Roles.LoupGarou : null;
        remotePlayer.imgL1 = document.createElement("img");
        remotePlayer.imgL1.src = "/img/Bonhomme-2/Bonhomme2-"+remotePlayer.color+"-L.png";
        remotePlayer.imgR1 = document.createElement("img");
        remotePlayer.imgR1.src = "/img/Bonhomme-2/Bonhomme2-"+remotePlayer.color+".png";
        remotePlayer.imgL2 = document.createElement("img");
        remotePlayer.imgL2.src = "/img/Bonhomme-1/Bonhomme1-"+remotePlayer.color+"-L.png";
        remotePlayer.imgR2 = document.createElement("img");
        remotePlayer.imgR2.src = "/img/Bonhomme-1/Bonhomme1-"+remotePlayer.color+".png";
        remotePlayer.imgL3 = document.createElement("img");
        remotePlayer.imgL3.src = "/img/Bonhomme-3/Bonhomme3-"+remotePlayer.color+"-L.png";
        remotePlayer.imgR3 = document.createElement("img");
        remotePlayer.imgR3.src = "/img/Bonhomme-3/Bonhomme3-"+remotePlayer.color+".png";
        remotePlayer.image = remotePlayer.getImg.next().value as HTMLImageElement;
        return remotePlayer;
    }

    socket.once("everyone_is_here", ()=>{
        socket.emit("get_tasks", player.pid);
    });

    socket.emit("joinPartie", {
        gameId: partie.id,
        position: player.getPosition(),
        index: numeroJoueur,
        color: player.color
    });
    socket.on("playerJoin", (data) => {
        if(data.id === user.id) {
            socket.emit("new_night", player.pid);
            return;
        }
        addRemotePlayer(data);
    });


    const MOVE_ANTISPAM_DURATION = 50;
    let moveAntiSpam = 0;
    player.on("move", () => {
        if(moveAntiSpam > Date.now()) return;
        moveAntiSpam = Date.now() + MOVE_ANTISPAM_DURATION;
        if (player.alive) {
            socket.emit("playerMove", {
                position: {
                    x: player.getPosition().x - Player.defaultSize.w / 2,
                    y: player.getPosition().y - Player.defaultSize.h / 2
                },
                index: numeroJoueur
            });
        }
    });

    socket.on("playerMove", (data) => {
        if(data.id === user.id) return;
        let remotePlayer = getPlayerById(data.id);
        if (!remotePlayer) remotePlayer = addRemotePlayer(data);
        //remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        //remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
        remotePlayer.slideTo(data.position, player, MOVE_ANTISPAM_DURATION).then(() => {
            player.updateDistance(data.id);
        });
    });

    socket.on("revive", id => {
        if (id === player.pid)
            return player.revive();

        for (const p of OTHER_PLAYERS) {
            if (p.pid === id) return player.revive();
        }
    });

    socket.on("kill", id => {
        if (id === player.pid)
            return player.die();
        for (const p of OTHER_PLAYERS) {
            if (p.pid === id) return p.die();
        }
    });

    socket.on("final_kill", () => {
       if (!player.alive) {
           player.ghost = true;
       }
    });

    socket.on("see_role", (data) => {
        if (player.role !== Roles.Voyante) return console.warn("WHAAAT");
        for (const p of OTHER_PLAYERS) {
            if (p.pid === data.id) {
                p.role = data.role;
                break;
            }
        }

        (player as Voyante).nb_boules --;
    });

    socket.on("drink", pos => {
        for (const l of environment.layers) {
            if (!l) continue;
            for (const o of l) {
                if (o.name !== "blood") continue;
                if (o.cord.x === pos.x && o.cord.y === pos.y) {
                    if (environment.interactions.includes(o)) {
                        environment.possibleInteractions.push(environment.interactions.splice(environment.interactions.indexOf(o), 1)[0]);
                    }
                    o.hide();
                }
            }
        }
    });

    socket.on("DAY",() => {
        let anim = $("#anim_day");
        $("#play").hide();
        anim.show();
        setTimeout(()=>{
            anim.hide();
            $("#vote").show();
            if (player.alive) voteDisponible = true;
            create_players(players);
            night = false;
        },4000);
    });

    socket.on("NIGHT", ()=>{
        let anim = $("#anim_night");
        $("#vote").hide();
        anim.show();
        socket.emit("get_tasks", player.pid);
        setTimeout(()=> {
            anim.hide();
            $("#play").show();
            night = true;
        }, 4000);
    });

    socket.on("nb_tasks", (nb) => {
        console.log(`nombre total de tâches restantes : ${nb}`);
    });

    socket.on("tasks", (tasks: {id: number, tasks: string[]}) => {
        if (player.role === Roles.LoupGarou) return;

        environment.possibleInteractions.push(...environment.interactions);
        environment.interactions = [];
        tasks.tasks.forEach(t => {
            let index;
            index = environment.possibleInteractions.findIndex(p => p.name === t);
            if (index === -1) return;
            environment.interactions.push(environment.possibleInteractions.splice(index, 1)[0]);
        });
    });

    socket.on("victoire", camp => {
        displayVictory(camp);
    });

    socket.on("history", (history) => {
        $("#history").html(history);
        canvas.hidden = true;
    });

    for (const o of player.environment.interactions) {
        o.on("end_game", (completed) => {
            o.endJeu(completed);
            HUD.miniJeu = false;
            if (completed)
                socket.emit("task_completed", player.pid, o.name);
        });
    }

    for (const o of player.environment.possibleInteractions) {
        o.on("end_game", (completed) => {
            o.endJeu(completed);
            HUD.miniJeu = false;
            if (completed)
                socket.emit("task_completed", player.pid, o.name);
        });
    }

    player.on("no_task", () => {
        player.objectInteract?.endJeu(false, false);
        HUD.miniJeu = false;
    });

    player.on("action", (data) => {
        data.maker = player.pid;
        socket.emit("action", {role, data});
    });

    player.on("action_available", p => {
        player.playerForAction = p;
        HUD.actionPossible = true;
    });

    player.on("action_unavailable", () => {
        player.playerForAction = null;
        HUD.actionPossible = false;
    });

    player.on("drink", poche => {
        poche.hide();
        if (environment.interactions.includes(poche)) {
            environment.possibleInteractions.push(environment.interactions.splice(environment.interactions.indexOf(poche), 1)[0]);
        }
        socket.emit("drink", {
            pos: {x: poche.cord.x, y: poche.cord.y},
            id: player.pid
        });
    });
}
init().then();
function draw() {
    requestAnimationFrame(draw);
    if (!player.alive) player.image = player.getImg.next().value as HTMLImageElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    environment.update(player.role === Roles.LoupGarou);
    if (player.ghost) ctx.drawImage(ghostimg, canvas.width/2 - (80 / 2), canvas.height/2 - (186 / 2));
    else ctx.drawImage(player.image, canvas.width/2 - (80 / 2), canvas.height/2 - (186 / 2));

    if (HUD.miniJeu) {
        requestAnimationFrame(() => {player.objectInteract?.drawJeu()});
    }
}
draw();

setTimeout(() => {
    if (player.role === Roles.LoupGarou) return;
    if (player.environment.interactions.length === 0)
        socket.emit("get_tasks", player.pid);
}, 3000);

const keys = [];
window.addEventListener("keydown",function(e){ keys["KEY_" + e.key.toUpperCase()] = true },false);
window.addEventListener('keyup',function(e){ keys["KEY_" + e.key.toUpperCase()] = false },false);
window.addEventListener("resize", () => {
    const diff = {w: canvas.width - window.innerWidth, h: canvas.height - window.innerHeight};
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (player.objectInteract?.miniJeuCanvas) {
        player.objectInteract.miniJeuCanvas.width = window.innerWidth;
        player.objectInteract.miniJeuCanvas.height = window.innerHeight;
    }
    environment.setCord({x: environment.origine.x - diff.w / 2, y: environment.origine.y - diff.h / 2});
});

const moveInterval = setInterval(() => {
    const ms = new Date().getMilliseconds();
    let diff = ms - last_ms;
    if (diff < 0) diff += 1000;
    last_ms = ms;
    const shift = keys["KEY_SHIFT"] === true;

    if (keys["KEY_E"] && !HUD.miniJeu && player.objectInteract !== null) {
        HUD.miniJeu = true;
        player.objectInteract.miniJeu(player);
    }

    if (keys["KEY_F"] && HUD.actionPossible) {
        HUD.actionPossible = false;
        player.action(player.playerForAction);
    }

    const up = keys["KEY_Z"] || keys["KEY_ARROWUP"];
    const left = keys["KEY_Q"] || keys["KEY_ARROWLEFT"];
    const down = keys["KEY_S"] || keys["KEY_ARROWDOWN"];
    const right = keys["KEY_D"] || keys["KEY_ARROWRIGHT"];

    if((up && !right && !down && !left) || (up && right && !down && left))
        player.move(PlayerMove.moveN, shift, diff);
    if(up && right && !down && !left)
        player.move(PlayerMove.moveNE, shift, diff);
    if((!up && right && !down && !left) || (up && right && down && !left))
        player.move(PlayerMove.moveE, shift, diff);
    if(!up && right && down && !left)
        player.move(PlayerMove.moveSE, shift, diff);
    if((!up && !right && down && !left) || (!up && right && down && left))
        player.move(PlayerMove.moveS, shift, diff);
    if(!up && !right && down && left)
        player.move(PlayerMove.moveSW, shift, diff);
    if((!up && !right && !down && left) || (up && !right && down && left))
        player.move(PlayerMove.moveW, shift, diff);
    if(up && !right && !down && left)
        player.move(PlayerMove.moveNW, shift, diff);
}, 1);


function sendMessage() {
    if (player.alive) {
        if (input.val() && `${input.val()}`.trim() !== "") {
            socket.emit('chat_message', user, input.val(), roomName);
            input.val("");
        }
    }
    else {
        alert("Les morts ne parlent pas");
    }
}

sendMsg.on("click", sendMessage);

socket.on('message', (user, msg) => {
    create_message(user, msg);
    messages.scrollTop(messages[0].scrollHeight);
});

function create_message(user, msg) {
    let item = $('<li>');
    let name = $(`<span class="msg_pseudo">${user.pseudo}</span>`);
    item.append(name);
    item.append(` : `).append($("<span>").text(msg));
    messages.append(item);
}

$(document).on("keydown", function (e){
    if (!night) {
        if (e.code === "Enter" || e.code === "NumpadEnter")
            sendMessage();
        if (e.key === "Escape") {
            let outer = $('.fond_blanc');
            if (outer.length > 0) {
                outer.addClass("disappear");
                setTimeout(function () {
                    outer.remove();
                }, 1000);
            }
        }
    }
});

function set_players(p, index :number) {
     let item = $('<div class="player">');

     let html = p.avatar.startsWith("#")
         ? `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=" "><div id="avatar_${index}" class="avatar"></div>`
         : `<img src="/avatars/${p.avatar}" class="avatar" alt=" ">`;

    let name = $(`<span class="pseudo">${p.pseudo}</span>`);

    let role;
    if (p.role !== undefined) {
        role = $(`<span class="role">${p.role}</span>`);
    }

    let button;
    if (voteDisponible) {
        button = $('<button class="vote">Vote</button>');
        button.id = index;
        button.on("click", function () {
            if (voteDisponible) {
                button.hide();
                voteDisponible = false;
                socket.emit("aVote", button.id);
            }
        });
        // else {
        //     $('<img src="/public/img/grave.jpg" alt="dead">');
        // }
    }

     item.append(html, name, role, button);
     return item;
}

function create_players(players) {
    listeJoueurs.empty();
    for (let i = 0; i < players.length; i++) {
        listeJoueurs.append(set_players(players[i], i));
        let avatar = $(`#avatar_${i}`);
        if (players[i].avatar.startsWith("#"))
            avatar.css("background-color", players[i].avatar);
    }
}

function endGame() {
    clearInterval(moveInterval);
    keys.fill(false);
}

/**
 *
 * @param camp
 * true if the Villagers won
 * false if the Werewolves won
 */
function displayVictory(camp) {
    endGame();
    $("#endGame")[0].hidden = false;
    $("#endGameTitle").text(`VICTOIRE : ${camp ? "VILLAGEOIS" : "LOUPS GAROUS"}`);
    socket.emit("history");
}
