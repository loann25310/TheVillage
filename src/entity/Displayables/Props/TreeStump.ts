import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";

export class TreeStump extends Displayable {

    public static image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);
        this.hittable = true;
    }

    draw() {
        this.ctx.drawImage(TreeStump.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

}