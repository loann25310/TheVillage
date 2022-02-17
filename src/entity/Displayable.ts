import {Coordinate} from "./types/Coordinate";
import {Environment} from "./Environment";

export class Displayable {

    ctx: CanvasRenderingContext2D;

    cord: Coordinate;

    environment: Environment;

    size: { w: number, h: number };

    speed: number;

    color: string;

    name: string;

    constructor(ctx, cord: Coordinate, size, color) {
        this.ctx = ctx;
        this.cord = cord;
        this.size = size;
        this.color = color;
        this.speed = 10;
        this.name = "";
    }

    getPosition(): Coordinate {
        if(!this.environment) return { x: 100, y: 0 };
        if(!this.environment.origine) return { x: 100, y: 0 };
        return {
            x: this.environment.origine.x + this.cord.x,
            y: this.environment.origine.y + this.cord.y
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.rect(this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    update() {
        this.draw();
    }

    setCord(cord: Coordinate) {
        this.cord = cord;
    }
}