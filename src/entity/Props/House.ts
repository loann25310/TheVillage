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
            clickable: false,
            tempsClick: null,
            tmp: null
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
            this.jeu.compteurTotal = 5;
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

        if(this.jeu.date.getTime() > this.jeu.maxTemps && !this.jeu.tromper) {
            if (this.jeu.compteurTotal > this.jeu.compteurCase) {
                this.jeu.compteurCase++;
                this.jeu.maxTemps = this.jeu.date.getTime() + 1000;
            } else {
                this.jeu.clickable = true;
            }
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if(this.jeu.date.getTime() < this.jeu.maxTemps-100 && !this.jeu.tromper) {
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
                if(!this.jeu.clickable) {
                    ctx.fillStyle = "#293148";
                }else if(this.jeu.clickable){
                    ctx.fillStyle = "#6e82b4";
                }
                if(this.jeu.tromper){
                    ctx.fillStyle = "#be0b0b";
                }
                ctx.fillRect(j * 150 + 925, i * 150 + 280, 140, 140);
            }
        }
        if(this.jeu.date.getTime()<this.jeu.tempsClick && !this.jeu.tromper) {
            ctx.fillStyle = "#cdd7f6";
            ctx.fillRect(this.jeu.tmp%3 * 150 + 925, Math.floor(this.jeu.tmp/3) * 150 + 280, 140, 140);
        }

        if (this.jeu.compteurTotal === 5 && !this.jeu.tromper) this.emit("end_game", true);
    }

    handleMouseUp() {
        if(!this.jeu.tromper && this.jeu.clickable) {
            if(this.testZones(this.jeu.mouseX, this.jeu.mouseY)) {
                if (this.jeu.mouseY >= Math.floor(this.jeu.caseAttendue / 3) * 150 + 280 &&
                    this.jeu.mouseY <= Math.floor(this.jeu.caseAttendue / 3) * 150 + 280 + 140 &&
                    this.jeu.mouseX >= this.jeu.caseAttendue % 3 * 150 + 925 &&
                    this.jeu.mouseX <= this.jeu.caseAttendue % 3 * 150 + 925 + 140
                ) {
                    this.jeu.click = true;
                    this.jeu.tempsClick = this.jeu.date.getTime()+100;
                    this.jeu.tmp = this.jeu.caseAttendue;
                } else {
                    this.jeu.tromper = true;
                    this.jeu.maxTemps = this.jeu.date.getTime() + 1000;
                }
            }
        }
    }

    testZones(mousex, mousey) {
        for (let i = 0; i < 9; i++) {
            if (mousey >= Math.floor(i / 3) * 150 + 280 &&
                mousey <= Math.floor(i / 3) * 150 + 280 + 140 &&
                mousex >= i % 3 * 150 + 925 &&
                mousex <= i % 3 * 150 + 925 + 140
            ) return true;
        }
        return false;
    }

    handleMouseMove(event) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (event.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
        this.jeu.mouseY = (event.clientY - rect.top) / this.miniJeuCanvas.offsetHeight * this.miniJeuCanvas.height;
    }

    hit(o: Displayable): boolean {
        if ((o.getPosition().x + o.size.w < this.cord.x) || (o.getPosition().x > this.cord.x + this.size.w) || (o.getPosition().y + o.size.h < this.cord.y) || (o.getPosition().y > this.cord.y + this.size.h)) return false;
        const ratioY = (this.size.h / 1718);
        const ratioX = (this.size.w / 1514);
        const bas_du_mur_du_haut = this.cord.y + (270 * ratioY);
        const haut_du_mur_du_bas = this.cord.y + (1450 * ratioY);
        const haut_mur_milieu = this.cord.y + (545 * ratioY);
        const bas_mur_milieu = this.cord.y + (775 * ratioY);
        const gauche_mur_milieu = this.cord.x + (675 * ratioX);
        const droite_mur_milieu = this.cord.x + (690 * ratioX);
        const largeur_mur_cotes = 70 * ratioX;
        const haut_porte_interieur = this.cord.y + (1070 * ratioY);
        const bas_porte_interieur = this.cord.y + (1370 * ratioY);
        const top_door = this.cord.y + 673 * ratioY;
        const bottom_door = this.cord.y + 1018 * ratioY;
        if (o.getPosition().y + o.size.h/4 < bas_du_mur_du_haut) return true; // touche le mur du haut
        if (o.getPosition().y + o.size.h / 3 > haut_du_mur_du_bas) return true; // touche le mur du bas
        if (o.getPosition().x < this.cord.x + largeur_mur_cotes) {
            return (o.getPosition().y +o.size.h/3 > bottom_door || o.getPosition().y < top_door); // touche le mur de gauche (ou est dans la porte)
        }
        if (o.getPosition().x + o.size.w / 4 >= this.cord.x + this.size.w - largeur_mur_cotes) return true; // touche le mur de droite
        if (o.getPosition().x + o.size.w / 4 > gauche_mur_milieu) {
            if (o.getPosition().x < droite_mur_milieu && o.getPosition().y + o.size.h/3 >= haut_mur_milieu) {
                return o.getPosition().y + o.size.h / 3 > bas_porte_interieur || o.getPosition().y < haut_porte_interieur; // touche (ou pqs) le mur vertical du milieu
            }
            if (o.getPosition().y + o.size.h/4 < bas_mur_milieu && o.getPosition().y + o.size.h/3 > haut_mur_milieu) return true; // touche le mur horizontal du milieu
            const bas_du_lit = this.cord.y + (1120 * ratioY);
            const haut_du_lit = this.cord.y + (930 * ratioY);
            const gauche_du_lit = this.cord.x + (1000 * ratioX);
            return o.getPosition().x + o.size.w/4 > gauche_du_lit && o.getPosition().y + o.size.h/4 < bas_du_lit && o.getPosition().y + o.size.h/3 > haut_du_lit;
        }

        return false

    }
}