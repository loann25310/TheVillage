import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";
import {Player} from "./Player";
import {toDegrees} from "chart.js/helpers";

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

    miniJeu(player: Player): void {
        this.player = player;
        this.miniJeuCanvas = document.createElement("canvas");
        this.miniJeuCanvas.width = (window.innerWidth / 10) * 9;
        this.miniJeuCanvas.height = (window.innerHeight / 10) * 9;
        document.body.appendChild(this.miniJeuCanvas);
        const c = $(this.miniJeuCanvas);
        c.addClass("task");
        this.miniJeuCanvas.addEventListener("mousedown", () => {this.handleMouseDown()});
        this.miniJeuCanvas.addEventListener("mouseup", () => {this.handleMouseUp()});
        this.miniJeuCanvas.addEventListener("mousemove", (e) => {this.handleMouseMove(e)});
        this.initJeu();
    }

    initJeu() {
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
        console.log(this.jeu.coords);
        console.log(this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        console.log(this.miniJeuCanvas.offsetWidth, this.miniJeuCanvas.offsetHeight);
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

        for (let i = 0; i < this.jeu.linked.length; i++) {
            ctx.fillStyle = this.jeu.gauche[this.jeu.linked[i][0]];
            const opposite = (this.jeu.coords[this.jeu.linked[i][0]].yMin - this.jeu.coords[this.jeu.linked[i][1]].yMin);
            const adjacent = (this.miniJeuCanvas.width - 80 - this.jeu.coords[this.jeu.linked[i][0]].xMax);
            //pas de calculs à faire si le trait est tout droit
            if (opposite === 0) {ctx.fillRect(this.jeu.coords[this.jeu.linked[i][0]].xMax, this.jeu.coords[this.jeu.linked[i][0]].yMin, adjacent,40 ); continue}
            const hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
            const angle = Math.atan( opposite / adjacent);
            ctx.save();
            ctx.translate(this.jeu.coords[this.jeu.linked[i][0]].xMax, angle < 0 ? this.jeu.coords[this.jeu.linked[i][0]].yMin : this.jeu.coords[this.jeu.linked[i][0]].yMax)
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
                    this.endJeu(true);
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
}