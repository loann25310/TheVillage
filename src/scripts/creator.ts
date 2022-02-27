import '../styles/creator.css';
import {ObjectType} from "../entity/types/ObjectType";
import {Environment} from "../entity/Environment";
import axios from "axios";
import {Displayable} from "../entity/Displayable";
//@ts-ignore
const map = _map;

const canvas = $("#canvas")[0] as HTMLCanvasElement;
const $objects = $("#objects");
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
if (map.players_spawn.length === 0) map.players_spawn.push({x: 0, y: 0});
env.create(canvas.getContext("2d"), map).then(() => {
    for (const o of env.getObjects()) {
        objects.push({object: o, interaction: false});
    }
    for (const o of env.interactions) {
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
    //todo: check if clicks on an object to move it;
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

function draw() {
    requestAnimationFrame(draw);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
}
function update(){
    if (keys["KEY_S"] || keys["KEY_ARROWDOWN"])
        env.move({x: 0, y: - Math.abs(20  -zoom)});
    if (keys["KEY_D"] || keys["KEY_ARROWRIGHT"])
        env.move({x: - Math.abs(20 -zoom), y: 0});
    if (keys["KEY_Q"] || keys["KEY_ARROWLEFT"])
        env.move({x: Math.abs(20 -zoom), y: 0});
    if (keys["KEY_Z"] || keys["KEY_ARROWUP"])
        env.move({x: 0, y: Math.abs(20 -zoom)});
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
function show_popup(o) {
    removePopup();
    const div = $("<div id='popup'>");
    div.css("top", `${mouse.y}px`);
    div.css("left", `${mouse.x}px`);
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
    return {div};
}
function removePopup() {
    if (!popup) return;
    document.body.removeChild(popup.div[0]);
    popup = null;
}
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
function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}
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
function drag(o: ObjectType, interaction: boolean) {
    dragged.interaction = interaction;
    dragged.object = env.createObject({type: o, coordonnees: {x: mouse.x - env.origine.x, y: mouse.y - env.origine.y}, size: {w: 100, h: 100}});
    dragged.object.name = o;
    if (interaction) env.interactions.push(dragged.object);
    objects.push({object: dragged.object, interaction});
}
async function saveMap() {
    $save.removeClass("green_btn");
    $save.addClass("red_btn");
    can_save = false;
    setTimeout(() => {
        can_save = true;
        $save.removeClass("red_btn");
        $save.addClass("green_btn");
    }, 10_000);
    map.objects = env.getObjects().map(o => {
        return o.save();
    });
    map.interactions = env.interactions.map(o => {
        return o.save();
    });
    //todo : change player_spawns, version, size
    const r = await axios.put("/creator/save", map);
    console.log(r.data.err ? r.data.err : r.data);

}