import {Player} from "../Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Blood} from "../Props/Blood";
import {Roles} from "./Roles";

export class LoupGarou extends Player {
    static readonly NB_POCHE_KILL = 2;
    private pochesDeSang: number;
    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.hasAction = true;
        this.pochesDeSang = 0;
        this.role = Roles.LoupGarou;
    }

    ramassePoche(poche: Blood) {
        this.pochesDeSang++;
        poche.drink();
    }

    action(player: Player) {
        if (this.pochesDeSang < LoupGarou.NB_POCHE_KILL) return;
        this.emit("action", {player});
        //todo : can kill a player
        player.die();
        this.pochesDeSang -= LoupGarou.NB_POCHE_KILL;
    }
}