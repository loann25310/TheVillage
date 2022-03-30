import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";

export class Bush extends Displayable {

    public static image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);
        this.hittable = true;
    }

    draw() {
        this.ctx.drawImage(Bush.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

}