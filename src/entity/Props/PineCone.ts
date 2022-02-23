import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";

export class PineCone extends Displayable {

    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);

        this.image = document.createElement("img");
        this.image.src = "/img/pomme_de_pin.png";
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    getPosition() {
        if (this.environment?.origine) return super.getPosition();
        return this.cord;
    }
}