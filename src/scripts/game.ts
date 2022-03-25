import * as $ from 'jquery';
import "../styles/task.css";
import {Player} from "../entity/Displayables/Props/Player";
import {Environment} from "../entity/Environment";
import {PlayerMove} from "../entity/types/PlayerMove";
import {io} from "socket.io-client";
import {Partie} from "../entity/Partie";
import {User} from "../entity/User";
import {Coordinate} from "../entity/types/Coordinate";
import {Villageois} from "../entity/roles/Villageois";
import {Map} from "../entity/Map";
import {Roles} from "../entity/roles/Roles";
import {Chasseur} from "../entity/roles/Chasseur";
import {Sorciere} from "../entity/roles/Sorciere";
import {Voyante} from "../entity/roles/Voyante";
import {LoupGarou} from "../entity/roles/LoupGarou";
import {Tools} from "../entity/Tools";
import {HUD} from "../entity/Displayables/HUD";

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

const socket = io();
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

Player.imgL1 = document.createElement("img");
Player.imgL1.src = `/img/Bonhomme2L.png`;
Player.imgR1 = document.createElement("img");
Player.imgR1.src = `/img/Bonhomme2R.png`;
Player.imgL2 = document.createElement("img");
Player.imgL2.src = `/img/Bonhomme1L.png`;
Player.imgR2 = document.createElement("img");
Player.imgR2.src = `/img/Bonhomme1R.png`;
Player.imgL3 = document.createElement("img");
Player.imgL3.src = `/img/Bonhomme3L.png`;
Player.imgR3 = document.createElement("img");
Player.imgR3.src = `/img/Bonhomme3R.png`;
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
let player;
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
const player_hud = new HUD({canvas, player});

let lock_key_u = false;
let playerCount = 1;

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
    socket.emit("new_night", player.pid, player.role === Roles.LoupGarou ? 0 : environment.interactions.length);

    // Init HUD in environment
    environment.addToLayer(150, player_hud);

    function addRemotePlayer(data: {id: number, position: Coordinate, index: number}): Player {
        let remotePlayer = new Villageois(ctx, environment, data.position, Player.defaultSize, map, data.index);
        remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
        remotePlayer.pid = data.id;
        OTHER_PLAYERS.push(remotePlayer);
        player.addOtherPlayer(remotePlayer);
        environment.addToLayer(100, remotePlayer);
        remotePlayer.role = LG.includes(remotePlayer.pid) ? Roles.LoupGarou : null;
        return remotePlayer;
    }

    socket.emit("joinPartie", {
        gameId: partie.id,
        position: player.getPosition(),
        index: numeroJoueur
    });
    socket.on("playerJoin", (data) => {
        if(data.id === user.id) return;
        addRemotePlayer(data);
    });


    const MOVE_ANTISPAM_DURATION = 50;
    let moveAntiSpam = 0;
    player.on("move", () => {
        if(moveAntiSpam > Date.now()) return;
        moveAntiSpam = Date.now() + MOVE_ANTISPAM_DURATION;
        socket.emit("playerMove", {
            position: {
                x: player.getPosition().x - Player.defaultSize.w / 2,
                y: player.getPosition().y - Player.defaultSize.h / 2
            },
            index: numeroJoueur
        });
    });

    socket.on("playerMove", (data) => {
        if(data.id === user.id) return;
        let remotePlayer = getPlayerById(data.id);
        if(!remotePlayer) remotePlayer = addRemotePlayer(data);
        //remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        //remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
        remotePlayer.slideTo(data.position, MOVE_ANTISPAM_DURATION).then(() => {
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
        for (const p of OTHER_PLAYERS)
            if (p.pid === id) return p.die();
    });

    socket.on("see_role", (data) => {
        if (player.role !== Roles.Voyante) return console.warn("WHAAAT");
        for (const p of OTHER_PLAYERS) {
            if (p.pid === data.id) {
                p.role = data.role;
                break;
            }
        }

        player.nb_boules --;
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

    socket.on("DAY", ()=>{
        console.log("cocorico");
    });

    socket.on("nb_tasks", (nb) => {
        console.log(`nombre total de tâches restantes : ${nb}`);
    });

    /* useless ? */
    //player.on("task", (/* object */) => {});

    for (const o of player.environment.interactions) {
        o.on("end_game", (completed) => {
            o.endJeu(completed);
            HUD.miniJeu = false;
        });
    }

    for (const o of player.environment.possibleInteractions) {
        o.on("end_game", (completed) => {
            o.endJeu(completed);
            HUD.miniJeu = false;
            if (completed)
                socket.emit("task_completed", environment.interactions.length);
        });
    }

    player.on("no_task", () => {
        player.objectInteract?.endJeu(false, false);
        HUD.miniJeu = false;
    });

    player.on("action", (data) => {
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
        socket.emit("drink", {x: poche.cord.x, y: poche.cord.y});
    });
}
init().then();

function draw() {
    requestAnimationFrame(draw);
    if (!player.alive) player.image = player.getImg.next().value as HTMLImageElement;
    player.getImg
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    environment.update();
    ctx.drawImage(player.image, canvas.width/2 - (80 / 2), canvas.height/2 - (186 / 2));

    if (HUD.miniJeu) {
        requestAnimationFrame(() => {player.objectInteract?.drawJeu()});
    }
}
draw();

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
setInterval(() => {
    let shift = keys["KEY_SHIFT"] === true;

    if (keys["KEY_E"] && !HUD.miniJeu && player.objectInteract !== null) {
        HUD.miniJeu = true;
        player.objectInteract.miniJeu(player);
    }

    if (keys["KEY_F"] && HUD.actionPossible) {
        player.action(player.playerForAction);
        HUD.actionPossible = false;
    }

    const up = keys["KEY_Z"] || keys["KEY_ARROWUP"];
    const left = keys["KEY_Q"] || keys["KEY_ARROWLEFT"];
    const down = keys["KEY_S"] || keys["KEY_ARROWDOWN"];
    const right = keys["KEY_D"] || keys["KEY_ARROWRIGHT"];

    if((up && !right && !down && !left) || (up && right && !down && left))
        player.move(PlayerMove.moveN, shift);
    if(up && right && !down && !left)
        player.move(PlayerMove.moveNE, shift);
    if((!up && right && !down && !left) || (up && right && down && !left))
        player.move(PlayerMove.moveE, shift);
    if(!up && right && down && !left)
        player.move(PlayerMove.moveSE, shift);
    if((!up && !right && down && !left) || (!up && right && down && left))
        player.move(PlayerMove.moveS, shift);
    if(!up && !right && down && left)
        player.move(PlayerMove.moveSW, shift);
    if((!up && !right && !down && left) || (up && !right && down && left))
        player.move(PlayerMove.moveW, shift);
    if(up && !right && !down && left)
        player.move(PlayerMove.moveNW, shift);
    $('.getPosition').text(`{ x: ${player.getPosition().x}, y: ${player.getPosition().y} }`);
    $('.getDrawnPosition').text(`{ x: ${player.getDrawnPosition().x}, y: ${player.getDrawnPosition().y} }`);
}, 1);
