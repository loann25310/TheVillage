import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";
import {Size} from "../../types/Size";

export class Bird extends Displayable {

    public static img1R: HTMLImageElement;
    public static img1L: HTMLImageElement;
    public static img2R: HTMLImageElement;
    public static img2L: HTMLImageElement;
    private getImg;
    public goesRight: boolean;
    private readonly decalage: number;
    private readonly vitesse: number;

    constructor(ctx: CanvasRenderingContext2D, cord: Coordinate, size: Size) {
        super(ctx, cord, size, "");
        this.goesRight = this.cord.x <= 0;
        this.getImg = this.imageGenerator();
        this.decalage = Math.random() * 1000;
        this.vitesse = Math.random() + 2;
    }

    getPosition() {
        if (this.environment?.origine) return super.getPosition();
        return this.cord;
    }

    draw() {
        this.ctx.drawImage(this.getImg.next().value, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    move(width: number, frames) {
        this.cord.x += (this.goesRight ? this.vitesse : - this.vitesse) * frames / 5;
        this.draw();
        if (this.cord.x + this.size.w >= width && this.goesRight)
            this.goesRight = false;
        else if (this.cord.x <= 0 && !this.goesRight)
            this.goesRight = true;
    }

    *imageGenerator() {
        while(true) {
            const millis = (new Date().getMilliseconds() + this.decalage) % 500;
            yield millis < 250 ? (this.goesRight ? Bird.img1R : Bird.img1L) : (this.goesRight ? Bird.img2R : Bird.img2L);
        }
    }
}