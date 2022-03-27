import {Player} from "../Displayables/Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "../types/Roles";

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
        if (!this.checkAction(player)) return;
        this.emit("action", {player : player.pid});
    }

    checkAction(player): boolean {
        return this.alive && this.nb_boules > 0 && (player.role === null || player.role === undefined);
    }
}