import {Player} from "../Displayables/Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Map} from "../Map";

export class Villageois extends Player {
    DISTANCE_FOR_ACTION = -1;
    constructor(ctx, environment, positonDraw: Coordinate, size, map: Map, index) {
        super(ctx, environment, positonDraw, size, map, index);
    }

    action() {}

    checkAction(): boolean {
        return false;
    }

    toString(): string {
        return "Villageois";
    }

    getDescription(): string {
        return "Vous faites partie du camp des villageois.<br> Vous ne possédez pas de capacités spéciales, mais êtes très fort à la pétanque.";
    }

    toColor(): string {
        return "rgb(12,204,211)";
    }
}