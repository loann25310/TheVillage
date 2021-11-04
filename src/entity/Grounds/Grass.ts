import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";

export class Grass extends Displayable{

    public static readonly defaultSize = { w: 970, h: 646 };
    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate) {
        super(ctx, cord, Grass.defaultSize, null);

        this.image = document.createElement("img");
        this.image.src = "/img/grass.jpg";
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

}