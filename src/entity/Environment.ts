import {Displayable} from "./Displayable";
import {Coordinate} from "./types/Coordinate";
import axios from 'axios';
import {Buisson} from "./Props/Buisson";
import {ObjectType} from "./types/ObjectType";
import {Size} from "./types/Size";

export class Environment {

    origine: Coordinate;
    layers: Displayable[][];

    constructor() {
        this.layers = [];
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
            let value = await axios.get('/map.json');
            for (const object  of value.data.objects as { type: ObjectType, coordonnees: Coordinate, size: Size }[]) {
                switch (object.type){
                    case ObjectType.buisson:
                        let buisson = new Buisson(ctx, {
                            x: object.coordonnees.x,
                            y: object.coordonnees.y
                        }, object.size);
                        this.addToLayer(5, buisson);
                        break;
                    case ObjectType.arbre:
                        break;
                    case ObjectType.caisse:
                        break;
                    case ObjectType.maison:
                        break;
                    case ObjectType.sapin:
                        break;
                    case ObjectType.fourche:
                        break;
                    case ObjectType.souche:
                        break;
                    case ObjectType.fleurs:
                        break;
                    case ObjectType.herbe:
                        break;
                    case ObjectType.pave:
                        break;
                    case ObjectType.bois:
                        break;

                }
            }
        }catch (error){
            console.log(error);
        }
    }

    move(movement: { x: number, y: number }){
        if(this.origine){
            this.origine.x += movement.x;
            this.origine.y += movement.y;
        }
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
}