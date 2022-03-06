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

    action(player: Player,  revive: boolean) {
        if (!this.alive) return;
        if (revive) {
            if (this.hasRevived) return;
            if (player.alive) return;
            this.emit("action", {player: player.pid, revive});
            player.revive();
            this.hasRevived = true;
        } else {
            if (this.hasKilled) return;
            if (!player.alive) return;
            this.emit("action", {player: player.pid, revive});
            player.die();
            this.hasKilled = true;
        }
    }
}