import {Player} from "../Displayables/Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "../types/Roles";

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
        if (!this.checkAction(player)) return;
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

    checkAction(player): boolean {
        return this.alive && (player.alive && !this.hasKilled || !player.alive && !this.hasRevived);
    }

    toString(): string {
        return "Sorcière";
    }

    getDescription(): string {
        return `Vous faites partie du camp des villageois.<br> Vous possédez 1 potion de vie pour ressusciter une personne, et une potion de mort pour en tuer une.`;
    }

    toColor(): string {
        return "rgb(12,211,82)";
    }
}