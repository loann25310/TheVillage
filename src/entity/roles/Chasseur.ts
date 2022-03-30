import {Player} from "../Displayables/Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "../types/Roles";

export class Chasseur extends Player {
    public hasShot: boolean;
    public bulletImg: HTMLImageElement;
    DISTANCE_FOR_ACTION = -1;
    constructor(ctx, environment, positonDraw: Coordinate, size, map, index) {
        super(ctx, environment, positonDraw, size, map, index);
        this.hasShot = false;
        this.role = Roles.Chasseur;
        this.bulletImg = document.createElement("img");
        this.bulletImg.src = '/img/bullet.png';
    }

    action(player: Player) {
        if (!this.checkAction(player)) return;
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

    checkAction(player): boolean {
        return !this.alive && !this.hasShot && player.alive;
    }

    toString(): string {
        return "Chasseur";
    }

    getDescription(): string {
        return "Vous faites partie du camp des villageois. <br>Quand vous mourrez, vous aurez la possibilité de tuer la personne de votre choix lors du vote du village.";
    }

    toColor(): string {
        return "rgb(204,211,12)";
    }
}