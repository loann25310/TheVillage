import * as $ from 'jquery';
import {Displayable} from "../entity/Displayable";
import {Buisson} from "../entity/Props/Buisson";
import {Player} from "../entity/Props/Player";
import {Grass} from "../entity/Grounds/Grass";
import {Environment} from "../entity/Environment";
import {Box} from "../entity/Props/Box";
import e from "express";
import {TreeStump} from "../entity/Props/TreeStump";
import {PlayerMove} from "../entity/types/PlayerMove";
import { io } from "socket.io-client";

const socket = io();
const environment: Environment = new Environment();
let deplacement: { x: number, y: number } = { x: 0, y: 0 };
let canvas = $('#mainCanvas')[0] as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player(ctx, environment, { x: (canvas.width-100) / 2, y: (canvas.height-152) / 2 }, Player.defaultSize);
const map = environment.create();

function draw(){
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2B2B2B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    environment.update();
    player.update();
}
draw();

const keys = [];
window.addEventListener("keydown",function(e){ keys["KEY_" + e.key.toUpperCase()] = true },false);
window.addEventListener('keyup',function(e){ keys["KEY_" + e.key.toUpperCase()] = false },false);

setInterval(() => {
    let shift = keys["KEY_SHIFT"] == true;

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
}, 1);

for (let i = 0; i < 50; i++) {
    let size = { w: 175, h: 130 };
    let buisson = new Buisson(ctx, { x: (size.w * i), y: 0 }, size);
    environment.addToLayer(5, buisson);
}

for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 10; j++) {
        let ground = new Grass(ctx, { x: (i * Grass.defaultSize.w ), y: (j * Grass.defaultSize.h ) });
        environment.addToLayer(0, ground);
    }
}

const otherPlayers: Player[] = [];

socket.on("ppid", ({pid}) => {
    console.log(`PID : ${pid}`);
    player.initLocal(pid,canvas);
    $('.origine')[0].innerHTML = `{ x: ${environment.origine.x}, y: ${environment.origine.y} }`;
    player.setCord({ x: 500, y: 500 });
    player.on("playerMove", function(event){
        $('.origine')[0].innerHTML = `{ x: ${environment.origine.x}, y: ${environment.origine.y} }`;
        $('.coordinate')[0].innerHTML = `{ x: ${event.cord.x}, y: ${event.cord.y} }`;
        /*socket.emit("move", {
            x: event.cord.x - (player.size.w / 2),
            y: event.cord.y - (player.size.h / 2)
        });*/
        socket.emit("move", event.cord);
    });
});
$('.coordinate')[0].innerHTML = `{ x: ${player.cord.x}, y: ${player.cord.y} }`;

socket.on("newPlayer", ({ remotePlayer }) => {
    if(!remotePlayer) return;
    if(player.pid === remotePlayer.pid) return;
    console.log(`New player pid : ${remotePlayer.pid}`);
    let other = new Player(ctx, environment, remotePlayer.cord, Player.defaultSize);
    otherPlayers[remotePlayer.pid] = other;
    other.initRemote(remotePlayer.pid, remotePlayer.cord, player, canvas);
    environment.addToLayer(6, other);
});

socket.on("removePlayer", ({ remotePlayer }) => {
    if(!remotePlayer) return;
    if(player.pid === remotePlayer.pid) return;
    console.log(`Remove player pid : ${remotePlayer.pid}`);
    let other = otherPlayers[remotePlayer.pid];
    if(!other) return;
    environment.removeFromLayer(6, other);
    otherPlayers[remotePlayer.pid] = null;
});

socket.on("movePlayer", ({ pid, cord }) => {
    if(pid === player.pid) return;
    //console.log(pid, cord);
    const other = otherPlayers[pid];
    if(!other) return;
    other.setCord(cord);
});


socket.on("boxPlaced", ({ by, cord }) => {
    if(by === player.pid) return;
    console.log("boxPlaced: ", cord)
    let box = new Box(ctx, cord, { w: 130, h: 130 });
    environment.addToLayer(4, box);
});

document.addEventListener('contextmenu', event => event.preventDefault());
$(document).mousedown(function(event){
   event.preventDefault();

   if(event.button === 0){
       let boxSize = { w: 130, h: 130 };
       let box = new Box(ctx, { x: player.cord.x, y: player.cord.y }, boxSize);
       //let box = new Box(ctx, { x: event.clientX - (boxSize.w / 2), y: event.clientY - (boxSize.h / 2) }, boxSize);
       socket.emit("box", box.cord );
       console.log("box", { cord: box.cord });
       environment.addToLayer(4, box);
   }else if(event.button === 2){
       let stumpSize = { w: 150, h: 150 };
       let stump = new TreeStump(ctx, { x: event.clientX - (stumpSize.w / 2), y: event.clientY - (stumpSize.h / 2) }, stumpSize );
       environment.addToLayer(4, stump);
   }
});