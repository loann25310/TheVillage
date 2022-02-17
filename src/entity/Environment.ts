import {Displayable} from "./Displayable";
import {Coordinate} from "./types/Coordinate";
import axios from 'axios';
import {Bush} from "./Props/Bush";
import {ObjectType} from "./types/ObjectType";
import {Size} from "./types/Size";
import {Box} from "./Props/Box";
import {TreeStump} from "./Props/TreeStump";
import {Grass} from "./Grounds/Grass";
import {Flower} from "./Grounds/Flower";
import {Tree} from "./Props/Tree";
import {House} from "./Props/House";
import {PineTree} from "./Props/PineTree";
import {Fork} from "./Props/Fork";
import {Wood} from "./Grounds/Wood";
import {Cobblestone} from "./Grounds/Cobblestone";
import {Dirt} from "./Grounds/Dirt";
import {Player} from "./Props/Player";

export class Environment {

    origine: Coordinate;
    layers: Displayable[][];
    size: { w: number, h: number };
    ctx: CanvasRenderingContext2D;
    interactions: Displayable[];

    constructor() {
        this.layers = [];
        this.interactions = [];
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

    setOrigine(origine: Coordinate) {
        this.origine = origine;
    }

    update(){
        for (const layer of this.layers) {
            if(!layer) continue;
            for (const object of layer) {
                object.update();
            }
        }
    }

    async create(ctx: CanvasRenderingContext2D){
        try {
            const value = await axios.get('/map.json');
            this.ctx = ctx;
            this.size = value.data.size;
            this.setOrigine({x: -value.data.players_spawn[0].x+ctx.canvas.width/2, y: -value.data.players_spawn[0].y+ctx.canvas.height/2});
            for (const object of value.data.objects as { type: ObjectType, coordonnees: Coordinate, size: Size }[]) {
                this.createObject(object);
            }

            for (const object of value.data.interactions as { type: ObjectType, coordonnees: Coordinate, size: Size }[]) {
                const o = this.createObject(object);
                //todo:  create a way to add a specific game linked to the object. (in the JSON, or add a random one);
                this.interactions.push(o);
            }

            console.log(this.size);
            for (let i = 0; i < this.size.w / 1000; i++) {
                for (let j = 0; j < this.size.h / 1000; j++) {
                    let terre = new Dirt(ctx, { x: i * 1000, y: j * 1000 }, { w: 1000, h: 1000 });
                    this.addToLayer(0, terre);
                }
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
        }
    }
}