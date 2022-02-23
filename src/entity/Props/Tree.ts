import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";

export class Tree extends Displayable {

    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);

        this.image = document.createElement("img");
        this.image.src = "/img/arbre.png";
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    initJeu() {
        this.jeu = {
            birds: [],
            mouseX: 0,
            mouseY: 0
        };
    }

    drawJeu() {

    }

    handleMouseMove(event) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (event.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
        this.jeu.mouseY = (event.clientY - rect.top) / this.miniJeuCanvas.offsetHeight * this.miniJeuCanvas.height;
    }
}