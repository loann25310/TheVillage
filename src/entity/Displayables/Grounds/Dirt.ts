import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";

export class Dirt extends Displayable{

    public static readonly defaultSize = { w: 2048, h: 2048 };
    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);

        this.image = document.createElement("img");
        this.image.src = "/img/kbuF9.jpg";
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

}