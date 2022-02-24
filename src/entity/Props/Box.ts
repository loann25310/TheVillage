import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";

export class Box extends Displayable {

    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);
        this.image = document.createElement("img");
        this.image.src = "/img/box.png";
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    initJeu() {
        this.miniJeuCanvas.addEventListener("mousedown", () => {this.handleMouseDown()});
        this.miniJeuCanvas.addEventListener("mouseup", () => {this.handleMouseUp()});
        this.miniJeuCanvas.addEventListener("mousemove", (e) => {this.handleMouseMove(e)});
        this.jeu = {
            gauche: [],
            droite: [],
            linked: [] as number[][],
            coords: [] as {fil: number, xMin: number, xMax: number, yMin: number, yMax: number}[],
            dragged: null,
            mouseX: null,
            mouseY: null,
            mouse: false
        };

        const c1 = ["#F00", "#FF0", "#00F", "#0F0"];
        const c2 = [];
        c2.push(...c1);
        for (let i = 0; c1.length > 0; i++) {
            this.jeu.gauche[i] = (c1.splice(Math.floor(Math.random() * c1.length), 1))[0];
            this.jeu.droite[i] = (c2.splice(Math.floor(Math.random() * c1.length), 1))[0];
            this.jeu.coords.push({
                fil: i,
                xMin: 20,
                xMax: 80,
                yMin: (this.miniJeuCanvas.height / 5) * (i + 1) - 20,
                yMax : (this.miniJeuCanvas.height / 5) * (i + 1) + 20
            });
        }
    }

    drawJeu() {
        const ctx = this.miniJeuCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        for (let i = 0; i < this.jeu.gauche.length; i++) {
            ctx.fillStyle = this.jeu.gauche[i];
            ctx.fillRect(20, (this.miniJeuCanvas.height / 5) * (i + 1) - 20, 60, 40);
            ctx.fillStyle = this.jeu.droite[i];
            ctx.fillRect(this.miniJeuCanvas.width - 80, (this.miniJeuCanvas.height / 5) * (i + 1) - 20, 60, 40);
        }

        for (let i = 0; i < this.jeu.linked.length; i++) {
            ctx.fillStyle = this.jeu.gauche[this.jeu.linked[i][0]];
            const trait = this.getLinkedPosition(this.jeu.coords[this.jeu.linked[i][0]], this.jeu.coords[this.jeu.linked[i][1]]);
            console.log(trait);
            if (trait.opposite === 0){ctx.fillRect(this.jeu.coords[this.jeu.linked[i][0]].xMax, this.jeu.coords[this.jeu.linked[i][0]].yMin, trait.adjacent,40 ); continue;}
            ctx.save();
            ctx.translate(this.jeu.coords[this.jeu.linked[i][0]].xMax, trait.angle < 0 ? this.jeu.coords[this.jeu.linked[i][0]].yMin : this.jeu.coords[this.jeu.linked[i][0]].yMax)
            ctx.rotate(- trait.angle);
            ctx.fillRect(0, 0, trait.hypotenuse, trait.angle < 0 ? 40 : -40);
            ctx.restore();
        }
        if (this.jeu.dragged !== null) {
            const opposite = (this.jeu.coords[this.jeu.dragged].yMin + 20 - this.jeu.mouseY);
            const adjacent = (this.jeu.mouseX - this.jeu.coords[this.jeu.dragged].xMax);
            const hypotenuse = Math.sqrt((opposite * opposite) + (adjacent * adjacent));
            const angle = Math.atan(opposite / adjacent);
            ctx.save();
            ctx.fillStyle = this.jeu.gauche[this.jeu.dragged];
            ctx.translate(this.jeu.coords[this.jeu.dragged].xMax, angle < 0 ? this.jeu.coords[this.jeu.dragged].yMin : this.jeu.coords[this.jeu.dragged].yMax);
            ctx.rotate(-angle);
            ctx.fillRect(0, 0, hypotenuse, angle < 0 ? 40 : -40);
            ctx.restore();
        }
    }

    handleMouseDown() {
        this.jeu.mouse = true;
        if (!this.jeu.mouseX || !this.jeu.mouseY) return;
        for (let i = 0; i < this.jeu.coords.length; i++) {
            if (
                this.jeu.mouseX >= this.jeu.coords[i].xMin &&
                this.jeu.mouseX <= this.jeu.coords[i].xMax &&
                this.jeu.mouseY >= this.jeu.coords[i].yMin &&
                this.jeu.mouseY <= this.jeu.coords[i].yMax
            ) {
                for (let j = 0; j < this.jeu.linked.length; j++) {
                    if (this.jeu.linked[j][0] === i) {
                        this.jeu.dragged = null;
                        return;
                    }
                }
                this.jeu.dragged = i;
            }
        }
    }
    handleMouseUp() {
        let d = null;
        for (let i = 0; i < this.jeu.coords.length; i++) {
            if (
                this.jeu.mouseX >= this.miniJeuCanvas.width - 80 &&
                this.jeu.mouseX <= this.miniJeuCanvas.width - 20 &&
                this.jeu.mouseY >= this.jeu.coords[i].yMin &&
                this.jeu.mouseY <= this.jeu.coords[i].yMax
            ) {
                d = i;
                break;
            }
        }
        if (d !== null) {
            if (this.jeu.gauche[this.jeu.dragged] === this.jeu.droite[d]) {
                this.jeu.linked.push([this.jeu.dragged, d]);
                if (this.jeu.linked.length === this.jeu.gauche.length) {
                    this.emit('end_game', true);
                    return;
                }
            }
        }
        this.jeu.mouse = false;
        this.jeu.dragged = null;
    }
    handleMouseMove(e) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (e.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
        this.jeu.mouseY = (e.clientY - rect.top) / this.miniJeuCanvas.offsetHeight * this.miniJeuCanvas.height;
    }

    getLinkedPosition(left: {
        fil: number,
        xMin: number,
        xMax: number,
        yMin: number,
        yMax : number}, right: {
        fil: number,
        xMin: number,
        xMax: number,
        yMin: number,
        yMax : number}): {opposite: number, adjacent: number, hypotenuse: number, angle: number} {
        if (left.yMax === right.yMax) {
            return {
                opposite: 0,
                //twice xMax because I only saved the left parts (so the Xs are the same for both right and left)
                adjacent: (this.miniJeuCanvas.width -  2 * right.xMax),
                hypotenuse: 0,
                angle: 0
            }
        }

        const largeur = (left.yMax - left.yMin);

        const diagonale = Math.sqrt(((this.miniJeuCanvas.width - 2 * right.xMax) ** 2) + (((left.yMax > right.yMax) ? ((left.yMax - right.yMin)) : (left.yMin - right.yMax)) ** 2));
        const longueur = Math.sqrt(Math.abs((largeur * largeur) - (diagonale * diagonale)));
        const angleRectangle = Math.atan(largeur / longueur);
        const angleDeBase = Math.atan(((left.yMax > right.yMax) ? ((left.yMax - right.yMin)) : (left.yMin - right.yMax)) / (this.miniJeuCanvas.width - 2 * right.xMax));
        const angle = left.yMax > right.yMax ? angleRectangle - angleDeBase : -angleRectangle - angleDeBase;
        return {
            opposite: largeur,
            adjacent: longueur,
            hypotenuse: diagonale,
            angle: -angle
        };
    }
}