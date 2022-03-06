import {Player} from "../Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Map} from "../Map";

export class Villageois extends Player {
    DISTANCE_FOR_ACTION = -1;
    constructor(ctx, environment, positonDraw: Coordinate, size, map: Map, index) {
        super(ctx, environment, positonDraw, size, map, index);
    }

    action() {}
}