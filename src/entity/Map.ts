import {Coordinate} from "./types/Coordinate";
import {ObjectType} from "./types/ObjectType";
import {Size} from "./types/Size";

export class Map {

    objects: {
        type: ObjectType,
        coordonnees: Coordinate,
        size: { w: number, h: number }
    }[];

    interactions: {
        type: ObjectType,
        coordonnees: Coordinate,
        size: Size
    }[];

    players_spawn: Coordinate[];

    nom_map: string;

    version: string;

    size: { w: number, h: number };

}