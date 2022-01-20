import * as $ from 'jquery';
import {Displayable} from "../entity/Displayable";
import {Bush} from "../entity/Props/Bush";
import {Player} from "../entity/Props/Player";
import {Grass} from "../entity/Grounds/Grass";
import {Environment} from "../entity/Environment";
import {Box} from "../entity/Props/Box";
import e from "express";
import {TreeStump} from "../entity/Props/TreeStump";
import {PlayerMove} from "../entity/types/PlayerMove";
import { io } from "socket.io-client";
import {data} from "jquery";
import {Coordinate} from "../entity/types/Coordinate";

const environment: Environment = new Environment();
let canvas = $('#mainCanvas')[0] as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player(ctx, environment, { x: (canvas.width-100) / 2, y: (canvas.height-152) / 2 }, Player.defaultSize);

async function init(){
    await environment.create(ctx);
}
init().then();

let personnage = new Image();

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    personnage.src = "/img/Bonhomme.gif";
    environment.update();
    ctx.drawImage(personnage, canvas.width/2 -150, canvas.height/2 -150);
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
