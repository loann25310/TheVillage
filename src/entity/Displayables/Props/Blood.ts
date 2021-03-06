import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";
import {Size} from "../../types/Size";
import {Player} from "./Player";
import {Roles} from "../../types/Roles";
import {LoupGarou} from "../../roles/LoupGarou";

export class Blood extends Displayable {
    public isFull: boolean;
    public static img: HTMLImageElement;
    constructor(ctx: CanvasRenderingContext2D, cord: Coordinate, size: Size, color="red") {
        super(ctx, cord, size, color);
        this.isFull = true;
    }

    draw() {
        if (!this.isFull) return;
        this.ctx.drawImage(Blood.img, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    drink() {
        if (!this.isFull) return false;
        this.isFull = false;
        return true;
    }

    miniJeu(player: Player) {
        if (player.role !== Roles.LoupGarou) return;
        (player as LoupGarou).ramassePoche(this);
        this.drink();
    }
}