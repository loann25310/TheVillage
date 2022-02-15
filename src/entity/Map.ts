import {Coordinate} from "./types/Coordinate";

export class Map {

    objects: {
        type: string,
        coordonnees: Coordinate,
        size: { w: number, h: number }
    };

    players_spawn: Coordinate[];

    nom_map: string;

    version: string;

    size: { w: number, h: number };

}