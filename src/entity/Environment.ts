import {Displayable} from "./Displayable";
import {Coordinate} from "./types/Coordinate";
import axios from 'axios';

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
    async create(){
        const response = await axios.get('/map.json');
        console.log(response);
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