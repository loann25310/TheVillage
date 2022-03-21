import {Player} from "../Displayables/Props/Player";
import {Coordinate} from "../types/Coordinate";
import {Roles} from "./Roles";

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

    drawInfo() {
        super.drawInfo();
        this.ctx.fillStyle = "#CD913C";
        this.ctx.textAlign = "left";
        this.ctx.font = "30px sans-serif";
        this.ctx.fillText(`${this.hasShot ? 0 : 1}`, 20, window.innerHeight - 80);
        this.ctx.drawImage(this.bulletImg, 40, innerHeight - 100, 23, 23);
    }
}