import {Displayable} from "../Displayable";
import {Coordinate} from "../../types/Coordinate";
import {Bird} from "./Bird";

export class Tree extends Displayable {
    public static image: HTMLImageElement;
    public static readonly NB_BIRDS = 5;
    public static readonly NB_BULLETS = 7;
    public static readonly TAILLE_CROSSHAIR = 80;

    constructor(ctx, cord: Coordinate, size) {
        super(ctx, cord, size, null);
        this.hittable = true;
    }

    draw() {
        this.ctx.drawImage(Tree.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    initJeu() {
        const bulletImg = document.createElement("img");
        bulletImg.src = `/img/bullet.png`;
        this.jeu = {
            birds: [],
            mouseX: innerWidth / 2,
            mouseY: innerHeight / 2,
            cx: this.miniJeuCanvas.width / 2 + 40,
            cy: this.miniJeuCanvas.height / 2 + 40,
            bullets: Tree.NB_BULLETS,
            bulletImg,
            lastMs: new Date().getMilliseconds()
        };
        if (!Bird.img1R) {
            Bird.img1R = document.createElement("img");
            Bird.img1R.src = `/img/bird1R.png`;
            Bird.img2R = document.createElement("img");
            Bird.img2R.src = `/img/bird2R.png`;
            Bird.img1L = document.createElement("img");
            Bird.img1L.src = `/img/bird1L.png`;
            Bird.img2L = document.createElement("img");
            Bird.img2L.src = `/img/bird2L.png`;
        }
        for (let i = 0; i < Tree.NB_BIRDS; i++) {
            this.jeu.birds.push(new Bird(this.miniJeuCanvas.getContext("2d"),
                {
                    x: Math.random() < 0.5 ? -100 : this.miniJeuCanvas.width + 100,
                    y: Math.random() * (this.miniJeuCanvas.height / Tree.NB_BIRDS - 100) + this.miniJeuCanvas.height / Tree.NB_BIRDS * i
                },
                {w: 100, h: 100}));
        }
        this.miniJeuCanvas.addEventListener("mousemove", (e) => {this.handleMouseMove(e)});
        this.miniJeuCanvas.addEventListener("mouseup", ()=>{this.handleMouseUp()});
    }

    drawJeu() {
        const d = new Date().getMilliseconds();
        const inter = (d - this.jeu.lastMs + 1000) % 1000;
        this.jeu.lastMs = d;
        const ctx = this.miniJeuCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        for (const b of this.jeu.birds) {
            b.move(this.miniJeuCanvas.width, inter);
        }
        this.moveCrosshair(inter);
        this.drawCrosshair(ctx);
    }

    moveCrosshair(inter: number) {
        const adjacent = Math.abs(this.jeu.mouseX - this.jeu.cx);
        const oppose = Math.abs(this.jeu.cy - this.jeu.mouseY);
        const angle = Math.atan(oppose / adjacent);
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        if (adjacent > 7.07)
            this.jeu.cx += (inter / 1.8) * (this.jeu.mouseX < this.jeu.cx ? -dx : dx);
        else this.jeu.cx = this.jeu.mouseX;
        if (oppose > 7.07)
            this.jeu.cy += inter / 1.8 * (this.jeu.mouseY < this.jeu.cy ? -dy : dy);
        else
            this.jeu.cy = this.jeu.mouseY;
    }

    drawCrosshair(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "#AD711C";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.ellipse(this.jeu.cx, this.jeu.cy, Tree.TAILLE_CROSSHAIR / 2, Tree.TAILLE_CROSSHAIR / 2, 0, Math.PI * 2, 0);
        ctx.rect(this.jeu.cx - 2, this.jeu.cy + 19, 4, 14);
        ctx.rect(this.jeu.cx - 2, this.jeu.cy - 33, 4, 14);
        ctx.rect(this.jeu.cx + 19, this.jeu.cy - 2, 14, 4);
        ctx.rect(this.jeu.cx - 33, this.jeu. cy - 2, 14, 4);
        ctx.textAlign = "end";
        ctx.font = "50px sans-serif";
        ctx.fillStyle = "#AD711C";
        for (let i = 1; i <= this.jeu.bullets; i++) {
            ctx.drawImage(this.jeu.bulletImg, this.miniJeuCanvas.width - 40 * i - 60, this.miniJeuCanvas.height-130);
        }
        ctx.drawImage(this.jeu.bulletImg, this.miniJeuCanvas.width - 100, this.miniJeuCanvas.height-130);
        ctx.stroke();
    }

    handleMouseUp() {
        this.jeu.bullets --;
        for (const b of this.jeu.birds) {
            if (this.jeu.cx < b.cord.x + b.size.w && this.jeu.cx > b.cord.x && this.jeu.cy > b.cord.y && this.jeu.cy < b.cord.y + b.size.h) {
                this.jeu.birds.splice(this.jeu.birds.indexOf(b), 1);
                if (this.jeu.birds.length === 0) this.emit("end_game", true);
                else if (this.jeu.bullets === 0) this.emit("end_game", false);
                return;
            }
        }
        if (this.jeu.bullets === 0) this.emit("end_game", false);
    }

    handleMouseMove(event) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (event.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
        this.jeu.mouseY = (event.clientY - rect.top) / this.miniJeuCanvas.offsetHeight * this.miniJeuCanvas.height;
    }
}