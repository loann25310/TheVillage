import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";
import {PineCone} from "./PineCone";

export class PineTree extends Displayable {

    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);
        this.image = document.createElement("img");
        this.image.src = "/img/sapin.png";
        this.hittable = true;
    }



    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    initJeu() {
        this.miniJeuCanvas.addEventListener("mousemove", (e) => {
            this.handleMouseMove(e)
        });
        this.jeu = {
            mouseX: null,
            pommes : [] as PineCone[],
            compteur: 0,
            hauteur: -50,
            gain: 10
        };
        for (let i = 0; i < 10; i++) {
            this.jeu.pommes.push(new PineCone(this.miniJeuCanvas.getContext("2d"), {
                x: Math.random() * (this.miniJeuCanvas.width - 100),
                y: this.jeu.hauteur
            }, {w: 70, h: 50}));
            this.jeu.hauteur -= 700;
        }
    }

    drawJeu() {
        const ctx = this.miniJeuCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#e3bc00";
        ctx.fillText(`Pommes de pin récupérées : ${this.jeu.compteur} / ${this.jeu.gain}`, this.miniJeuCanvas.width/2, 50);
        ctx.fillStyle = "#9e590a";
        ctx.ellipse(this.jeu.mouseX, this.miniJeuCanvas.height-100, 100, 75, Math.PI, Math.PI, 0);
        ctx.fill();
        for (let pomme of this.jeu.pommes){
            pomme.draw();
            pomme.setCord({
                x: pomme.cord.x,
                y: pomme.cord.y+10
            });
            if (pomme.cord.y >= this.miniJeuCanvas.height) {
                this.initJeu();
            }
            if(pomme.cord.x >= this.jeu.mouseX-100 && pomme.cord.x <= this.jeu.mouseX+100 && pomme.cord.y >= this.miniJeuCanvas.height-120 && pomme.cord.y <= this.miniJeuCanvas.height-50){
                this.jeu.pommes.splice(this.jeu.pommes.indexOf(pomme),1);
                this.jeu.compteur+=1;
            }
        }
        if(this.jeu.compteur === this.jeu.gain) this.emit("end_game", true);
    }

    handleMouseMove(e) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (e.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
    }
}