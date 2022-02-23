import {Displayable} from "../Displayable";
import {Coordinate} from "../types/Coordinate";

export class HayBale extends Displayable {
    public static readonly NB_HAY_BALES = 15;
    public passed: boolean;
    public inside: boolean;
    public correct: boolean;
    public vx: number;
    public vy: number;
    private readonly image: HTMLImageElement;
    constructor(ctx, cord: Coordinate, size, passed: boolean) {
        super(ctx, cord, size, passed ? "green" : "yellow");
        this.passed = passed;
        this.inside = this.correct = false;
        this.image = document.createElement("img");
        this.image.src = `/img/${passed ? 'Passed':''}HayBale.png`;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
    }

    getPosition() {
        if (this.environment?.origine) return super.getPosition();
        return this.cord;
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
    }

    initJeu() {
        this.miniJeuCanvas.addEventListener("mousedown", () => {this.handleMouseDown()});
        this.miniJeuCanvas.addEventListener("mouseup", () => {this.handleMouseUp()});
        this.miniJeuCanvas.addEventListener("mousemove", (e) => {this.handleMouseMove(e)});
        this.jeu = {
            hayBales: [] as HayBale[],
            mouse: false,
            mouseX: 0,
            mouseY: 0,
            dragged: null,
            diffX: 0,
            diffY: 0
        };
        mainLoop: for (let i = 0; i < HayBale.NB_HAY_BALES; i++) {
            const coord = {x: Math.floor(Math.random() * (this.miniJeuCanvas.width - 70 - 2 * HayBale.rectWidth()) + HayBale.rectWidth()), y: Math.floor(Math.random() * (this.miniJeuCanvas.height - 50))} as Coordinate;
            const h = new HayBale(this.miniJeuCanvas.getContext("2d"), coord, {w: 70, h: 50}, Math.random() < 0.5);
            for (const hay of this.jeu.hayBales)
                if (h.hit(hay)) continue mainLoop;
            this.jeu.hayBales.push(h);
        }
    }

    drawJeu() {
        const ctx = this.miniJeuCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        const TAILLE_RECT = HayBale.rectWidth();
        ctx.fillStyle = "#E6A51A";
        ctx.fillRect(this.miniJeuCanvas.width - TAILLE_RECT, 0, TAILLE_RECT, window.innerHeight);
        ctx.fillStyle = "#009D6F";
        ctx.fillRect(0, 0, TAILLE_RECT, window.innerHeight);
        for (const h of this.jeu.hayBales) {
            if (h === this.jeu.dragged) {
                this.moveDragged(h);
                continue;
            }
            h.move(this.jeu.hayBales, this.miniJeuCanvas);
        }
    }

    moveDragged(h) {
        h.vx = this.jeu.mouseX - this.jeu.diffX - h.cord.x;
        h.vy = this.jeu.mouseY - this.jeu.diffY - h.cord.y;
        h.cord.x = this.jeu.mouseX - this.jeu.diffX;
        h.cord.y = this.jeu.mouseY - this.jeu.diffY;
        if (h.cord.x < HayBale.rectWidth()) {
            if (!h.passed) h.cord.x = HayBale.rectWidth() + 1;
        } else if (h.cord.x > this.miniJeuCanvas.width - HayBale.rectWidth()) {
            if (h.passed) h.cord.x = this.miniJeuCanvas.width - HayBale.rectWidth() - h.size.w - 1;
        }
        h.cord.y = Math.max(0, h.cord.y);
        h.cord.y = Math.min(this.miniJeuCanvas.height - h.size.h, h.cord.y);

        h.draw();
    }

    handleMouseDown() {
        this.jeu.mouse = true;
        for (const h of this.jeu.hayBales){
            if (h.correct) continue;
            if (this.jeu.mouseX >= h.cord.x &&
                this.jeu.mouseX <= h.cord.x + h.size.w &&
                this.jeu.mouseY >= h.cord.y &&
                this.jeu.mouseY <= h.cord.y + h.size.h
            ) {
                this.jeu.dragged = h;
                this.jeu.diffX = this.jeu.mouseX - h.cord.x;
                this.jeu.diffY = this.jeu.mouseY - h.cord.y;
                break;
            }
        }
    }

    handleMouseUp() {
        if (this.jeu.dragged.cord.x < HayBale.rectWidth()) {
            if (this.jeu.dragged.passed) {
                this.jeu.dragged.correct = true;
                this.jeu.dragged.cord.x = (HayBale.rectWidth() - this.jeu.dragged.size.w) / 2;
                this.jeu.dragged.vx = 0;
            }
        }else if (this.jeu.dragged.cord.x + this.jeu.dragged.size.w > this.miniJeuCanvas.width - HayBale.rectWidth()) {
            if (!this.jeu.dragged.passed) {
                this.jeu.dragged.correct = true;
                this.jeu.dragged.cord.x = this.miniJeuCanvas.width - (HayBale.rectWidth() + this.jeu.dragged.size.w) / 2;
                this.jeu.dragged.vx = 0;
            }
        }
        let finished = true;
        for (const h of this.jeu.hayBales) {
            if (!h.correct) {
                finished = false;
                break;
            }
        }
        if (finished) this.emit("end_game", true);
        this.jeu.mouse = false;
        this.jeu.dragged = null;
    }

    handleMouseMove(event) {
        const rect = this.miniJeuCanvas.getBoundingClientRect();
        this.jeu.mouseX = (event.clientX - rect.left) / this.miniJeuCanvas.offsetWidth * this.miniJeuCanvas.width;
        this.jeu.mouseY = (event.clientY - rect.top) / this.miniJeuCanvas.offsetHeight * this.miniJeuCanvas.height;
    }

    move(hayBales, canvas) {
        const hits = [];
        this.vx = this.vx < 0 ? Math.max(-5, this.vx) : Math.min(5, this.vx);
        this.vy = this.vy < 0 ? Math.max(-5, this.vy) : Math.min(5, this.vy);
        for (const h of hayBales) {
            if (h.correct || h === this || this.correct) continue;
            if (this.hit(h)) {
                hits.push(h);
                if (h.vx === 0){
                    this.vx *= -1;
                } else {
                    const vx = this.vx;
                    this.vx = h.vx;
                    h.vx = vx;
                }
                if (h.vy === 0) {
                    this.vy *= -1;
                } else {
                    const vy = this.vy;
                    this.vy = h.vy;
                    h.vy = vy;
                }
            }
        }
        if (!this.correct && this.cord.x + this.vx <= HayBale.rectWidth() || this.cord.x + this.size.w + this.vx > canvas.width - HayBale.rectWidth()) this.vx *= -1;
        if (this.cord.y + this.vy <= 0 || this.cord.y + this.size.h + this.vy > canvas.height) this.vy *= -1;
        do {
            this.cord.y += this.vy;
            this.cord.x += this.vx;
            if(this.hitMultiple(hits)) {
                if (this.vx === this.vy && this.vx === 0){
                    this.vx = Math.random() * 2 - 1;
                    this.vy = Math.random() * 2 - 1;
                }
            } else break;
        } while (true);
        this.draw();
    }

    hit(h: HayBale): boolean {
        return ((
            this.cord.x + this.size.w >= h.cord.x &&
            this.cord.x + this.size.w <= h.cord.x + h.size.w
        ) || (
            this.cord.x >= h.cord.x &&
            this.cord.x <= h.cord.x + h.size.w
        )) && ((
            this.cord.y + this.size.h >= h.cord.y &&
            this.cord.y + this.size.h <= h.cord.y + h.size.h
        ) || (
            this.cord.y >= h.cord.y &&
            this.cord.y <= h.cord.y + h.size.h
        ));
    }

    hitMultiple(bales: HayBale[]) {
        for (const h of bales)
            if (this.hit(h)) return true;
        return false;
    }

    static rectWidth() {
        return window.innerWidth / 10;
    }
}