import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";

export class House extends Displayable {

    private readonly image: HTMLImageElement;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);

        this.image = document.createElement("img");
        this.image.src = "/img/maison.png";
        this.hittable = true;
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    initJeu() {
        this.miniJeuCanvas.addEventListener("mouseup", () => {this.handleMouseUp()});
        this.miniJeuCanvas.addEventListener("mousemove", (e) => {this.handleMouseMove(e)});
        this.jeu = {
            ecran: [],
            compteur: 0,
            compteurCase:0,
            compteurTotal: 0,
            maxTemps: null,
            date: null,
            mouseX: 0,
            mouseY: 0,
            caseAttendue: null,
            click: false,
            tromper: false,
            clickable: false
        };
        for (let i = 0; i < 5; i++) {
            this.jeu.ecran.push(Math.floor(Math.random() * 9))
        }
        this.jeu.date = new Date;
        console.log(this.jeu.ecran);
    }

    drawJeu() {
        this.jeu.date = new Date();
        const ctx = this.miniJeuCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.fillStyle = "#a49292";
        ctx.fillRect(225, 150, 590, 640);
        for(let i = 0; i < 5; i++) {
            ctx.fillStyle = "#151414";
            ctx.ellipse(i * 100 + 315, 200, 8, 8, Math.PI, 0, 2*Math.PI);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = "#16ef1e";
        if(this.jeu.tromper) {
            ctx.fillStyle = "#fc0000";
            if(this.jeu.maxTemps < this.jeu.date.getTime()) this.initJeu();
        }
        for(let i = 0; i < this.jeu.compteurTotal; i++) {
            ctx.ellipse(i * 100 + 315, 200, 5, 5, Math.PI, 0, 2*Math.PI);
            ctx.fill();
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(275, 255, 490, 490);
        if(this.jeu.click){
            this.jeu.click = false;
            if (this.jeu.compteur < this.jeu.compteurTotal) {
                this.jeu.compteur += 1;
            } else {
                this.jeu.compteur = 0;
                this.jeu.compteurTotal++;
                this.jeu.clickable = false;
                this.jeu.compteurCase = 0;
                this.jeu.maxTemps = this.jeu.date.getTime() + 1000;
            }
        }
        this.jeu.caseAttendue = this.jeu.ecran[this.jeu.compteur];

        if(this.jeu.maxTemps === null) {
            this.jeu.maxTemps = this.jeu.date.getTime()+1000;
        }

        if(this.jeu.date.getTime() > this.jeu.maxTemps-100) {
            if (this.jeu.compteurTotal > this.jeu.compteurCase) {
                this.jeu.compteurCase++;
                this.jeu.maxTemps = this.jeu.date.getTime() + 1000;
            } else {
                this.jeu.clickable = true;
            }
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if(this.jeu.date.getTime() < this.jeu.maxTemps-100) {
                    if (this.jeu.ecran[this.jeu.compteurCase] == (i * 3 + j)) {
                        ctx.fillStyle = "#16ef1e";
                        ctx.fillRect(j * 150 + 300, i * 150 + 280, 140, 140);
                    }
                }else {
                    break;
                }
            }
        }
        ctx.beginPath();
        ctx.strokeStyle = "#ffffff";
        ctx.rect(900, 255, 490, 490);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillStyle = "#293148";
                ctx.fillRect(j * 150 + 925, i * 150 + 280, 140, 140);
            }
        }

        if (this.jeu.compteurTotal === 5) this.emit("end_game", true);
    }

    handleMouseUp() {
        if(!this.jeu.tromper && this.jeu.clickable) {
            if (this.jeu.mouseY >= Math.floor(this.jeu.caseAttendue / 3) * 150 + 280 &&
                this.jeu.mouseY <= Math.floor(this.jeu.caseAttendue / 3) * 150 + 280 + 140 &&
                this.jeu.mouseX >= this.jeu.caseAttendue % 3 * 150 + 925 &&
                this.jeu.mouseX <= this.jeu.caseAttendue % 3 * 150 + 925 + 140
            ) {
                this.jeu.click = true;
            }else{
                this.jeu.tromper = true;
                this.jeu.maxTemps = this.jeu.date.getTime()+500;
            }
        }
    }

    handleMouseMove(event) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (event.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
        this.jeu.mouseY = (event.clientY - rect.top) / this.miniJeuCanvas.offsetHeight * this.miniJeuCanvas.height;
    }

}