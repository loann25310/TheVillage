import {Player} from "../Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "./Roles";

export class Chasseur extends Player {
    public hasShot: boolean;
    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.hasShot = false;
        this.role = Roles.Chasseur;
    }

    action(player: Player) {
        if (this.alive) return;
        if (this.hasShot) return;
        this.emit("action", {player});
        player.die();
        this.hasShot = true;
    }

    die() {
        super.die();
        //todo : this.action() à la prochaine journée.
    }

    revive() {
        super.revive();
    }
}