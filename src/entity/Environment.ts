import {Displayable} from "./Displayables/Displayable";
import {Coordinate} from "./types/Coordinate";
import axios from 'axios';
import {Bush} from "./Displayables/Props/Bush";
import {ObjectType} from "./types/ObjectType";
import {Size} from "./types/Size";
import {Box} from "./Displayables/Props/Box";
import {TreeStump} from "./Displayables/Props/TreeStump";
import {Grass} from "./Displayables/Grounds/Grass";
import {Flower} from "./Displayables/Grounds/Flower";
import {Tree} from "./Displayables/Props/Tree";
import {House} from "./Displayables/Props/House";
import {PineTree} from "./Displayables/Props/PineTree";
import {Fork} from "./Displayables/Props/Fork";
import {Wood} from "./Displayables/Grounds/Wood";
import {Cobblestone} from "./Displayables/Grounds/Cobblestone";
import {Dirt} from "./Displayables/Grounds/Dirt";
import {HayBale} from "./Displayables/Props/HayBale";
import {Map} from "./Map";
import {Player} from "./Displayables/Props/Player";
import {Blood} from "./Displayables/Props/Blood";

export class Environment {

    origine: Coordinate;
    layers: Displayable[][];
    size: { w: number, h: number };
    ctx: CanvasRenderingContext2D;
    interactions: Displayable[];
    doneInteractions: Displayable[];
    possibleInteractions: Displayable[];
    hitBoxes: Displayable[][][];
    static readonly NB_TASK_PER_DAY = 2;

    constructor() {
        this.layers = [];
        this.interactions = [];
        this.hitBoxes = [];
        this.possibleInteractions = [];
        this.doneInteractions = [];
        this.setOrigine({x:0,y:0});
    }

    addToLayer(layer: number, object: Displayable){
        if(!this.layers[layer])
            this.layers[layer] = [];
        object.environment = this;
        this.layers[layer].push(object);
    }

    removeFromLayer(layer: number, object: Displayable){
        if(!this.layers[layer])
            this.layers[layer] = [];
        if(!this.layers[layer].includes(object)) return;
        this.layers[layer].splice(this.layers[layer].indexOf(object), 1);
    }

    removeObject(object: Displayable) {
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].includes(object)) {
                this.removeFromLayer(i, object);
                break;
            }
        }
        for (let i = 0; i < this.interactions.length; i++) {
            if (this.interactions[i] === object) {
                return this.interactions.splice(i, 1);
            }
        }
    }

    setOrigine(origine: Coordinate) {
        this.origine = origine;
    }

    update(LG: boolean = true){
        for (const layer of this.layers) {
            if(!layer) continue;
            for (const object of layer) {
                if (!LG && object.name === "blood")
                    continue;
                if (!object.hidden)
                    object.update();
            }
        }
    }

    async create(ctx: CanvasRenderingContext2D, map: Map = null){
        try {

            if(!map)
                map = (await axios.get(`/maps/The_village.json`)).data;

            this.ctx = ctx;

            this.size = map.size;

            this.setOrigine({x: Player.defaultSize.w / 2, y:Player.defaultSize.h / 2});

            for (let i = 0; i < this.size.w / 1000; i++) {
                for (let j = 0; j < this.size.h / 1000; j++) {
                    let terre = new Dirt(ctx, { x: i * 1000, y: j * 1000 }, { w: 1000, h: 1000 });
                    this.addToLayer(0, terre);
                }
            }
            for (const object of map.objects) {
                const o = this.createObject(object);
                o.name = object.type;
                this.addHitBox(o);
            }

            for (const object of map.interactions) {
                const o = this.createObject(object);
                o.name = object.type;
                this.possibleInteractions.push(o);
                this.addHitBox(o);
            }
        } catch (error) {
            console.error(error);
        }
    }

    move(movement: { x: number, y: number }){
        this.origine.x += movement.x;
        this.origine.y += movement.y;

    }

    setCord(cord: {x: number; y: number}) {
        this.origine = cord;
    }

    setSpeed(speed: number) {
        for (const layer of this.layers) {
            if(!layer) continue;
            for (const object of layer) {
                object.speed = speed;
            }
        }
    }

    createObject(object: { type: ObjectType, coordonnees: Coordinate, size: Size }): Displayable {
        switch (object.type){
            case ObjectType.buisson:
                let buisson = new Bush(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, buisson);
                return buisson;
            case ObjectType.arbre:
                let arbre = new Tree(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, arbre);
                return arbre;
            case ObjectType.caisse:
                let box = new Box(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, box);
                return box;
            case ObjectType.maison:
                let maison = new House(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, maison);
                return maison;
            case ObjectType.sapin:
                let sapin = new PineTree(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, sapin);
                return sapin;
            case ObjectType.fourche:
                let fourche = new Fork(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, fourche);
                return fourche;
            case ObjectType.souche:
                let souche = new TreeStump(this.ctx, object.coordonnees, object.size);
                this.addToLayer(1, souche);
                return souche;
            case ObjectType.fleurs:
                let fleur = new Flower(this.ctx, object.coordonnees, object.size);
                this.addToLayer(0, fleur);
                return fleur;
            case ObjectType.herbe:
                let grass = new Grass(this.ctx, object.coordonnees, object.size);
                this.addToLayer(0, grass);
                return grass;
            case ObjectType.terre:
                let terre = new Dirt(this.ctx, object.coordonnees, object.size);
                this.addToLayer(0, terre);
                return terre;
            case ObjectType.pave:
                let pave = new Cobblestone(this.ctx, object.coordonnees, object.size);
                this.addToLayer(0, pave);
                return pave;
            case ObjectType.bois:
                let bois = new Wood(this.ctx, object.coordonnees, object.size);
                this.addToLayer(0, bois);
                return bois;
            case ObjectType.foin:
                const foin = new HayBale(this.ctx, object.coordonnees, object.size, false);
                this.addToLayer(1, foin);
                return foin;
            case ObjectType.blood:
                const blood = new Blood(this.ctx, object.coordonnees, object.size);
                this.addToLayer(2, blood);
                return blood;
        }
    }
    
    addHitBox(o: Displayable) {
        if (!o.hittable) return;
        for (let x = (o.cord.x - o.cord.x % 100); x <= (o.cord.x - o.cord.x % 100 + o.size.w - o.size.w % 100); x += 100) {
            if (!this.hitBoxes[x]) {
                this.hitBoxes[x] = [];
            }

            for (let y = o.cord.y - o.cord.y % 100; y <= o.cord.y - o.cord.y % 100 + o.size.h - o.size.h % 100; y += 100) {
                if (!this.hitBoxes[x][y]) {
                    this.hitBoxes[x][y] = [];
                }
                this.hitBoxes[x][y].push(o);
            }
        }
    }

    getHitBox(cord: Coordinate, size: Size): Displayable[] {
        const objects = [] as Displayable[];
        for (let x = (cord.x - cord.x % 100); x <= (cord.x - cord.x % 100 + size.w - size.w % 100); x += 100) {
            if (!this.hitBoxes[x]) {
                continue;
            }

            for (let y = cord.y - cord.y % 100; y <= cord.y - cord.y % 100 + size.h - size.h % 100; y += 100) {
                if (!this.hitBoxes[x][y]) {
                    continue;
                }
                for (const o of this.hitBoxes[x][y]) {
                    if (!objects.includes(o)){
                        objects.push(o);
                    }
                }
            }
        }
        return objects;
    }

    initNight() {
        if (this.possibleInteractions.length <= 0) return;
        const nb = this.possibleInteractions[0].name === "blood" ? Environment.NB_TASK_PER_DAY * 3 : Environment.NB_TASK_PER_DAY;
        for (let i = 0; i < nb && this.possibleInteractions.length > 0; i++) {
            this.interactions.push(this.possibleInteractions.splice(Math.floor(Math.random() * this.possibleInteractions.length), 1)[0]);
        }
        for (const o of this.interactions) {
            o.show();
            if (o.name === "blood") {
                (o as Blood).isFull = true;
            }
        }
    }

    getObjects() {
        const objects = [];
        for (const layer of this.layers) {
            if (!layer) continue;
            for (const o of layer){
                if (!o.name || this.possibleInteractions.includes(o) || o.name === "terre") continue;
                objects.push(o);
            }
        }
        return objects;
    }
}