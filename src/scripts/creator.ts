import '../styles/creator.css';
import {ObjectType} from "../entity/types/ObjectType";
import {Environment} from "../entity/Environment";
import axios from "axios";
import {Displayable} from "../entity/Displayables/Displayable";
import Swal from "sweetalert2";
//@ts-ignore
const map = _map;

const canvas = $("#canvas")[0] as HTMLCanvasElement;
const $objects = $("#objects");
const $width = $("#width");
const $height = $("#height");
const $name = $("#map_name");
const $save = $("#save");
map.nom_map = $name.val();
const keys = [];
let mouse = {x : 0, y: 0, click: false};
const rect = canvas.getBoundingClientRect();
canvas.width = window.innerWidth - rect.left;
canvas.height = window.innerHeight;
let dragged = {object: null, interaction: null};
let can_save = true;
let ctrl_z = true;
let popup = null;
const objects = [] as {object: Displayable, interaction: boolean}[];
let zoom = 0;
const rightClickObjects = [] as {object: Displayable, interaction: boolean}[];

createObjectChoice();
const env = new Environment();
if (map.players_spawn.length === 0) map.players_spawn = new Array(15).fill({x: 500, y: 500});
env.create(canvas.getContext("2d"), map).then(() => {
    for (const o of env.getObjects()) {
        objects.push({object: o, interaction: false});
    }
    for (const o of env.possibleInteractions) {
        objects.push({object: o, interaction: true});
    }
    requestAnimationFrame(draw);
});

window.addEventListener("keydown",function(e){ keys["KEY_" + e.key.toUpperCase()] = true },false);
window.addEventListener('keyup',function(e){ keys["KEY_" + e.key.toUpperCase()] = false },false);
window.addEventListener("contextmenu", (e) => {
    if (mouse.x < 0) return;
    e.preventDefault();
    rightClickObjects.splice(0, rightClickObjects.length);
    for (const o of objects) {
        if (mouse.x - env.origine.x >= o.object.cord.x &&
            mouse.x - env.origine.x <= o.object.cord.x + o.object.size.w &&
            mouse.y - env.origine.y >= o.object.cord.y &&
            mouse.y - env.origine.y <= o.object.cord.y + o.object.size.h
        ) {
            rightClickObjects.push(o);
        }
    }
    if (rightClickObjects.length === 0) return;
    popup = show_popup(rightClickObjects[0]);
});
window.addEventListener("resize", () => {
    const rect = canvas.getBoundingClientRect();
    const diff = {w: canvas.width - window.innerWidth + rect.left, h: canvas.height - window.innerHeight};
    canvas.width = window.innerWidth - rect.left;
    canvas.height = window.innerHeight;
    env.setCord({x: env.origine.x - diff.w / 2, y: env.origine.y - diff.h / 2});
});
window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / canvas.offsetWidth * canvas.width);
    mouse.y = ((e.clientY - rect.top) / canvas.offsetHeight * canvas.height);

    if (dragged.object) {
        dragged.object.cord.x = Math.round(mouse.x - env.origine.x);
        dragged.object.cord.y = Math.round(mouse.y - env.origine.y);
    }
});
window.addEventListener("mousedown", ()=>{
    mouse.click = true;
});
window.addEventListener("mouseup", ()=>{
    mouse.click = false;
    if (mouse.x < 0) {
        env.removeObject(dragged.object);
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].object === dragged.object){
                objects.splice(i, 1);
                break;
            }
        }
    }
    dragged.object = null;
});

$objects.on("mousedown", (e)=>{e.preventDefault()});
$name.on("input", () => {
    if (($name.val() as string).length > 0) map.nom_map = $name.val();
});
$save.on("click", saveMap);

/**
 * draws everything
 */
function draw() {
    requestAnimationFrame(draw);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    ctx.font = "40px sans-serif";
    ctx.fillStyle = 'red';
    ctx.textAlign = "center";
    ctx.fillText(`x : ${-env.origine.x}  |  y : ${-env.origine.y}`, innerWidth/2 - 300, innerHeight-100);
}

/**
 * updates the canvas (yes indeed)
 */
async function update(){
    if (keys["KEY_S"] || keys["KEY_ARROWDOWN"])
        env.move({x: 0, y: - Math.abs(20  -zoom)});
    if (keys["KEY_D"] || keys["KEY_ARROWRIGHT"])
        env.move({x: - Math.abs(20 -zoom), y: 0});
    if (keys["KEY_Q"] || keys["KEY_ARROWLEFT"])
        env.move({x: Math.abs(20 -zoom), y: 0});
    if (keys["KEY_Z"] || keys["KEY_ARROWUP"])
        env.move({x: 0, y: Math.abs(20 -zoom)});
    if (keys["KEY_CONTROL"] && keys["KEY_S"] && keys["KEY_SHIFT"] && can_save){
        await saveMap();
    }
    if (keys["KEY_CONTROL"] && keys["KEY_Z"] && ctrl_z) {
        ctrl_z = false;
        setTimeout(()=>{ctrl_z = true}, 500);
        //todo: add a ctrl z cmd
    }
    if (keys["KEY_ESCAPE"]) {
        removePopup();
    }
    if (keys["KEY_+"]) {
        zoom ++;
    }
    if (keys["KEY_-"]){
        zoom --;
    }
    if (keys["KEY_0"]){
        zoom = 0;
    }
    for (const layer of env.layers) {
        if(!layer) continue;
        for (const object of layer) {
            if (zoom === 0) {object.update(); continue;}
            const size = {w: object.size.w, h: object.size.h};
            const cord = {x: object.cord.x, y: object.cord.y};
            object.size.w += size.w / 100 * zoom;
            object.size.h += size.h / 100 * zoom;
            object.cord.x += cord.x / 100 * zoom;
            object.cord.y += cord.y / 100 * zoom;
            object.update();
            object.size = size;
            object.cord = cord;
        }
    }
}

/**
 * Change la popup pour un autre élément
 * @param o
 * l'objet actuellement montré
 * @param sens
 * true : objet suivant
 * false : objet précédent
 * @param x
 * la position x de la popup actuelle
 * @param y
 * la position y de la popup actuelle
 */
function nextPopup(o, sens: boolean, x, y) {
    if (rightClickObjects.length < 2) return;
    removePopup();
    const index = rightClickObjects.indexOf(o);
    if (index === rightClickObjects.length - 1) popup = show_popup(rightClickObjects[0], x, y);
    else popup = show_popup(rightClickObjects[index + 1], x, y);
}

/**
 * Creates a popup to change the caracts of on object
 * @param o
 * the object to change
 * @param x
 * the x position of the popup - default : mouse position
 * @param y
 * the y position of the popup - default : mouse position
 */
function show_popup(o, x=mouse.x, y=mouse.y) {
    removePopup();
    const div = $("<div id='popup'>");
    if (rightClickObjects.length > 1) {
        //todo: les icones marchent pas j'ai le seum
        const directions = $("<span>");
        const right = $('<button>suivant</button>');
        right.on("click", () => {nextPopup(o, true, x, y);});
        const left = $('<button>précédent</button>');
        left.on("click", () => {nextPopup(o, false, x, y);});
        directions.append(left, right);
        div.append(directions);
    }
    const nom = $("<h3>");
    nom.text(o.object.name);
    div.append(nom);
    const inter = $("<p>");
    inter.text(`interaction : ${o.interaction}`);
    div.append(inter);
    const inputWidth = $(`<input type='number' placeholder='largeur' value='${o.object.size.w}'>`);
    const inputHeight = $(`<input type='number' placeholder='hauteur' value='${o.object.size.h}'>`);
    inputWidth.on("input", () => {
        o.object.size.w = Math.round(+inputWidth.val());
    });
    inputHeight.on("input", () => {
        o.object.size.h = Math.round(+inputHeight.val());
    });
    const inputX = $(`<input type='number' placeholder='x' value='${o.object.cord.x}'>`);
    const inputY = $(`<input type='number' placeholder='y' value='${o.object.cord.y}'>`);
    inputX.on("input", () => {
        o.object.cord.x = Math.round(+inputX.val());
    });
    inputY.on("input", () => {
        o.object.cord.y = Math.round(+inputY.val());
    });
    div.append(`<label>largeur : `, inputWidth, `</label> <label>hauteur : `, inputHeight, `</label>`);
    div.append(`<label for="x">X : </label>`, inputX,`<label for="y">Y : </label>`, inputY);
    const remove = $("<button class='red_btn'>Supprimer</button>");
    remove.on("click", ()=>{
        objects.splice(objects.indexOf(o), 1);
        env.removeObject(o.object);
        removePopup();
    });
    div.append(remove);
    document.body.appendChild(div[0]);
    div.css("top", `${Math.min(y, innerHeight - div[0].offsetHeight)}px`);
    div.css("left", `${Math.min(x, innerWidth - div[0].offsetWidth)}px`);
    return {div};
}

/**
 * removes the popup if it exists
 */
function removePopup() {
    if (!popup) return;
    document.body.removeChild(popup.div[0]);
    popup = null;
}

/**
 * creates the store (on the left side of the screen), from all types of objects
 */
function createObjectChoice(){
    for (const o of enumKeys(ObjectType)) {
        const div = $("<div>");
        div.html(`
            <h1>${o.toUpperCase()}</h1>
            <img src="${getImage(o)}" alt=""><br>     
        `);
        const input = $(`<input type="checkbox" name='${o}'>Interaction</input>`);
        div.append(input);
        div[0].id = o;
        div.addClass("object");
        div.on("mousedown", () => {drag(o as ObjectType, (input[0] as HTMLInputElement).checked)});
        $objects.append(div);
    }
}

/**
 * returns all values of an enum (stolen from internet though)
 * @param obj
 * the enum
 */
function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

/**
 * returns the image's url from the object
 * @param o
 * the object's type
 */
function getImage(o): string {
    switch (o) {
        case ObjectType.caisse:
            return `/img/box.png`;
        case ObjectType.fleurs:
            return `/img/fleurs.svg`;
        case ObjectType.souche:
            return `/img/tree_stump.png`;
        case ObjectType.pave:
            return `/img/pave.jpg`;
        case ObjectType.bois:
            return `/img/bois.jpg`;
        case ObjectType.foin:
            return `/img/HayBale.png`;
        default:
            return `/img/${o}.png`;
    }
}

/**
 * Creates and drags an object from the store (left side of the screen)
 * @param o
 * The type of the object
 * @param interaction
 * `true` if the object interacts (has a mini-game), `false` if not.
 */
function drag(o: ObjectType, interaction: boolean) {
    dragged.interaction = interaction;
    dragged.object = env.createObject({type: o, coordonnees: {x: mouse.x - env.origine.x, y: mouse.y - env.origine.y}, size: {w: +($width.val()), h: +($height.val())}});
    dragged.object.name = o;
    if (interaction) env.possibleInteractions.push(dragged.object);
    objects.push({object: dragged.object, interaction});
}

/**
 * Saves the current map into a JSON file (server-sided)
 */
async function saveMap() {
    can_save = false;
    if ($save.hasClass("green_btn")) {
        $save.removeClass("green_btn");
        $save.addClass("red_btn");
    }
    setTimeout(() => {can_save = true}, 10_000);
    map.objects = env.getObjects().map(o => {
        return o.save();
    });
    map.interactions = env.possibleInteractions.map(o => {
        return o.save();
    });
    //todo : change player_spawns, version, size
    const r = await axios.put("/creator/save", map);
    if ($save.hasClass("red_btn")) {
        $save.removeClass("red_btn");
        $save.addClass("green_btn");
    }
    console.log(r.data.err ? r.data.err : r.data);
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });

    await Toast.fire({
        icon: 'success',
        title: 'Map sauvegardée'
    });
}