import {Player} from "../Displayables/Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Blood} from "../Displayables/Props/Blood";
import {Roles} from "./Roles";

export class LoupGarou extends Player {
    static readonly NB_POCHE_KILL = 1;
    DISTANCE_FOR_ACTION = 300;
    private pochesDeSang: number;
    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.hasAction = true;
        this.pochesDeSang = 0;
        this.role = Roles.LoupGarou;
    }

    ramassePoche(poche: Blood) {
        if (poche.drink()) {
            this.pochesDeSang++;
            this.emit("drink", poche);
        }
    }

    action(player: Player) {
        if (!this.checkAction(player)) return;
        this.emit("action", {player: player.pid});
        this.pochesDeSang -= LoupGarou.NB_POCHE_KILL;
    }

    checkAction(player): boolean {
        return this.pochesDeSang >= LoupGarou.NB_POCHE_KILL && this.alive && player.role !== Roles.LoupGarou;
    }
}