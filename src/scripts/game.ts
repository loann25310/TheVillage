import * as $ from 'jquery';
import "../styles/task.css";
import {Player} from "../entity/Props/Player";
import {Environment} from "../entity/Environment";
import {PlayerMove} from "../entity/types/PlayerMove";
import {io} from "socket.io-client";
import {Partie} from "../entity/Partie";
import {User} from "../entity/User";
import {Coordinate} from "../entity/types/Coordinate";

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

    function addRemotePlayer(data: {id: number, position: Coordinate}): Player {
        let remotePlayer = new Player(ctx, environment, data.position, Player.defaultSize);
        remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
        remotePlayer.pid = data.id;
        OTHER_PLAYERS.push(remotePlayer);
        environment.addToLayer(100, remotePlayer);
        return remotePlayer;
    }

    socket.emit("joinPartie", {
        gameId: partie.id,
        position: player.getPosition()
    });
    socket.on("playerJoin", (data) => {
        console.log(data);
        if(data.id === user.id) return;
        addRemotePlayer(data);
    });
    socket.on("playerMove", (data) => {
        console.log(data, data.id === user.id);
        if(data.id === user.id) return;
        let remotePlayer = getPlayerById(data.id);
        if(!remotePlayer) remotePlayer = addRemotePlayer(data);
        //console.log(data);
        remotePlayer.x = data.position.x - Player.defaultSize.w / 2;
        remotePlayer.y = data.position.y - Player.defaultSize.h / 2;
    });

    player.on("move", () => {
        socket.emit("playerMove", {
            position: player.getPosition()
        });
    });

    /* useless ? */
    player.on("task", (/* object */) => {});

    for (const o of player.environment.interactions) {
        o.on("end_game", (completed) => {
            o.endJeu(completed);
            miniJeu = false;
        });
    }

    player.on("no_task", () => {
        player.objectInteract?.endJeu(false);
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
let lock_key_u = false;
let miniJeu = false;
let playerCount = 1;
setInterval(() => {
    let shift = keys["KEY_SHIFT"] == true;

    if (keys["KEY_E"] && !miniJeu && player.objectInteract !== null) {
        miniJeu = true;
        player.objectInteract.miniJeu(player);
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
