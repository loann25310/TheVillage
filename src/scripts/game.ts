import * as $ from 'jquery';
import {Player} from "../entity/Props/Player";
import {Environment} from "../entity/Environment";
import {PlayerMove} from "../entity/types/PlayerMove";
import {io} from "socket.io-client";
import {Partie} from "../entity/Partie";
import {User} from "../entity/User";

// @ts-ignore
const partie = _partie as Partie;
// @ts-ignore
const user = _user as User;

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

const environment: Environment = new Environment();
let canvas = $('#mainCanvas')[0] as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player(ctx, environment, { x: (canvas.width-100) / 2, y: (canvas.height-152) / 2 }, Player.defaultSize);
player.x = (canvas.width-100) / 2;
player.y = (canvas.height-152) / 2;

async function init(){
    await environment.create(ctx);
    socket.emit("joinPartie", {
        gameId: partie.id,
        position: player.getPosition()
    });
    socket.on("playerJoin", (data) => {
        console.log(data);
        if(data.id === user.id) return;
        let remotePlayer = new Player(ctx, environment, data.position, Player.defaultSize);
        remotePlayer.x = data.position.x;
        remotePlayer.y = data.position.y;
        remotePlayer.pid = data.id;
        OTHER_PLAYERS.push(remotePlayer);
        environment.addToLayer(100, remotePlayer);
        console.log(`New user joined : ${data.pseudo}`);
    });
    socket.on("playerMove", (data) => {
        let remotePlayer = getPlayerById(data.id);
        if(!remotePlayer) return;
        console.log(data);
        remotePlayer.x = data.position.x;
        remotePlayer.y = data.position.y;
    });

    player.on("move", () => {
        socket.emit("playerMove", {
            position: player.getPosition()
        });
    });

    player.on("task", (data) => {
        console.log(data);
    });

    player.on("no_task", () => {
        console.log(false);
        miniJeu = false;
    });
}
init().then();

let personnage = new Image();

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    personnage.src = "/img/Bonhomme.png";
    environment.update();
    ctx.drawImage(personnage, canvas.width/2 - (80 / 2), canvas.height/2 - (186 / 2));
    if (player.objectInteract !== null) {
        ctx.textAlign = "center";
        ctx.font = "30px sans-serif";
        ctx.fillStyle = "red";
        ctx.fillText(`[E] pour interagir avec ${player.objectInteract.name}`, window.innerWidth / 2, window.innerHeight - 300);
    }
}
draw();

const keys = [];
window.addEventListener("keydown",function(e){ keys["KEY_" + e.key.toUpperCase()] = true },false);
window.addEventListener('keyup',function(e){ keys["KEY_" + e.key.toUpperCase()] = false },false);
let lock_key_u = false;
let miniJeu = false;
let playerCount = 1;

setInterval(() => {
    let shift = keys["KEY_SHIFT"] == true;

    if (keys["KEY_E"] && !miniJeu && player.objectInteract !== null) {
        miniJeu = true;
        console.log("ouverture de mini-jeu");
        // todo: @Yohann tu peux t'amuser ici c:
    }

    if(keys["KEY_U"] && !lock_key_u){
        lock_key_u = true;
        let p2 = new Player(ctx, environment, player.getPosition(), Player.defaultSize);
        p2.pid = playerCount++;
        environment.addToLayer(100, p2);
        console.log(player.getPosition());
        setTimeout(() => lock_key_u = false, 400);
    }

    if(keys["KEY_Z"] && !keys["KEY_D"] && !keys["KEY_S"] && !keys["KEY_Q"])
        player.move(PlayerMove.moveN, shift);
    if(keys["KEY_Z"] && keys["KEY_D"] && !keys["KEY_S"] && !keys["KEY_Q"])
        player.move(PlayerMove.moveNE, shift);
    if(!keys["KEY_Z"] && keys["KEY_D"] && !keys["KEY_S"] && !keys["KEY_Q"])
        player.move(PlayerMove.moveE, shift);
    if(!keys["KEY_Z"] && keys["KEY_D"] && keys["KEY_S"] && !keys["KEY_Q"])
        player.move(PlayerMove.moveSE, shift);
    if(!keys["KEY_Z"] && !keys["KEY_D"] && keys["KEY_S"] && !keys["KEY_Q"])
        player.move(PlayerMove.moveS, shift);
    if(!keys["KEY_Z"] && !keys["KEY_D"] && keys["KEY_S"] && keys["KEY_Q"])
        player.move(PlayerMove.moveSW, shift);
    if(!keys["KEY_Z"] && !keys["KEY_D"] && !keys["KEY_S"] && keys["KEY_Q"])
        player.move(PlayerMove.moveW, shift);
    if(keys["KEY_Z"] && !keys["KEY_D"] && !keys["KEY_S"] && keys["KEY_Q"])
        player.move(PlayerMove.moveNW, shift);
    $('.getPosition').text(`{ x: ${player.getPosition().x}, y: ${player.getPosition().y} }`);
    $('.getDrawnPosition').text(`{ x: ${player.getDrawnPosition().x}, y: ${player.getDrawnPosition().y} }`);
}, 1);
