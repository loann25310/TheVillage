import {Player} from "../Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "./Roles";

export class Voyante extends Player {
    public static readonly NB_BOULES_CRISTAL = 3;
    public nb_boules: number;

    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.nb_boules = Voyante.NB_BOULES_CRISTAL;
        this.role = Roles.Voyante;
    }

    action(player: Player) {
        if (this.nb_boules <= 0) return;
        this.emit("action", {player : player.pid});
    }
}