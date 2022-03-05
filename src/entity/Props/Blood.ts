import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";
import {Size} from "../types/Size";

export class Blood extends Displayable {
    public isFull: boolean;
    constructor(ctx: CanvasRenderingContext2D, cord: Coordinate, size: Size, color: string) {
        super(ctx, cord, size, color);
        this.isFull = true;
    }

    draw() {
        if (!this.isFull) return;
        super.draw();
    }

    drink() {
        this.isFull = false;
        //todo: remove it from the canvas;
    }
}