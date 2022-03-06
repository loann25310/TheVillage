import {Player} from "../Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "./Roles";

export class Sorciere extends Player {
    public hasRevived: boolean;
    public hasKilled: boolean;
    DISTANCE_FOR_ACTION = 300;

    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.hasKilled = false;
        this.hasRevived = false;
        this.role = Roles.Sorciere;
    }

    action(player: Player) {
        if (!this.alive) return;
        if (!player.alive) {
            if (this.hasRevived) return;
            this.emit("action", {player: player.pid, revive: true});
            player.revive();
            this.hasRevived = true;
        } else {
            if (this.hasKilled) return;
            this.emit("action", {player: player.pid, revive: false});
            player.die();
            this.hasKilled = true;
        }
    }
}