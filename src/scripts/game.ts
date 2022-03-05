import * as $ from 'jquery';
import "../styles/task.css";
import {Player} from "../entity/Props/Player";
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
player.setCord({
    x : -(canvas.width-Player.defaultSize.w) / 2,
    y : -(canvas.height-Player.defaultSize.h) / 2
});


async function init(){

    if(map)
        await environment.create(ctx, map);
    else
        await environment.create(ctx);
    environment.move({x: -canvas.width / 2, y : -canvas.height / 2});
    environment.setCord({x: canvas.width / 2 - map.players_spawn[numeroJoueur].x, y : canvas.height / 2 - map.players_spawn[numeroJoueur].y});

    function addRemotePlayer(data: {id: number, position: Coordinate, index: number}): Player {
        let remotePlayer = new Villageois(ctx, environment, data.position, Player.defaultSize, map, data.index);
        remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
        remotePlayer.pid = data.id;
        OTHER_PLAYERS.push(remotePlayer);
        environment.addToLayer(100, remotePlayer);
        return remotePlayer;
    }

    socket.emit("joinPartie", {
        gameId: partie.id,
        position: player.getPosition(),
        index: numeroJoueur
    });
    socket.on("playerJoin", (data) => {
        console.log(data);
        if(data.id === user.id) return;
        addRemotePlayer(data);
    });
    socket.on("playerMove", (data) => {
        if(data.id === user.id) return;
        let remotePlayer = getPlayerById(data.id);
        if(!remotePlayer) remotePlayer = addRemotePlayer(data);
        remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
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
            if (p.pid === id) return player.die();
    });

    socket.on("see_role", role => {
        if (player.role !== Roles.Voyante) return console.warn("WHAAAT");
        //todo: afficher le rôle (tout le temps au dessus du joueur ? juste une fois ?
        player.nb_boules --;
    });

    player.on("move", () => {
        socket.emit("playerMove", {
            position: player.getPosition(),
            index: numeroJoueur
        });
    });

    /* useless ? */
    //player.on("task", (/* object */) => {});

    for (const o of player.environment.interactions) {
        o.on("end_game", (completed) => {
            o.endJeu(completed);
            miniJeu = false;
        });
    }

    player.on("no_task", () => {
        player.objectInteract?.endJeu(false, false);
        miniJeu = false;
    });

    player.on("action", (data) => {
        socket.emit("action", {source: player.pid, role, data});
    });
}
init().then();

let personnage: HTMLImageElement;

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    personnage = player.image;
    environment.update();
    ctx.drawImage(personnage, canvas.width/2 - (80 / 2), canvas.height/2 - (186 / 2));
    if (player.objectInteract !== null && !miniJeu) {
        ctx.textAlign = "center";
        ctx.font = "30px sans-serif";
        ctx.fillStyle = "red";
        ctx.fillText(`[E] pour interagir avec ${player.objectInteract.name}`, window.innerWidth / 2, window.innerHeight - 300);
    }

    if (miniJeu) {
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
    environment.setCord({x: environment.origine.x - diff.w / 2, y: environment.origine.y - diff.h / 2});
});
let lock_key_u = false;
let miniJeu = false;
let playerCount = 1;
setInterval(() => {
    let shift = keys["KEY_SHIFT"] === true;

    if (keys["KEY_E"] && !miniJeu && player.objectInteract !== null) {
        miniJeu = true;
        player.objectInteract.miniJeu(player);
    }

    if(keys["KEY_U"] && !lock_key_u){
        lock_key_u = true;
        let p2 = new Villageois(ctx, environment, player.getPosition(), Player.defaultSize, map, 0);
        p2.pid = playerCount++;
        environment.addToLayer(100, p2);
        console.log(player.getPosition());
        setTimeout(() => lock_key_u = false, 400);
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
