import {Player} from "../Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "./Roles";

export class Voyante extends Player {
    public static readonly NB_BOULES_CRISTAL = 50;
    public nb_boules: number;
    DISTANCE_FOR_ACTION = 300;

    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.nb_boules = Voyante.NB_BOULES_CRISTAL;
        this.role = Roles.Voyante;
    }

    action(player: Player) {
        if (!this.checkAction()) return;
        this.emit("action", {player : player.pid});
    }

    checkAction(): boolean {
        return this.alive && this.nb_boules > 0;
    }
}