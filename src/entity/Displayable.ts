import {Coordinate} from "./types/Coordinate";
import {Environment} from "./Environment";
import {Player} from "./Props/Player";
import {Size} from "./types/Size";

export class Displayable {

    ctx: CanvasRenderingContext2D;

    miniJeuCanvas: HTMLCanvasElement;

    protected jeu;

    protected player: Player;

    cord: Coordinate;

    environment: Environment;

    size: { w: number, h: number };

    speed: number;

    color: string;

    name: string;

    hittable: boolean;

    protected readonly callbacks;

    constructor(ctx: CanvasRenderingContext2D, cord: Coordinate, size: Size, color: string) {
        this.ctx = ctx;
        this.cord = cord;
        this.size = size;
        this.color = color;
        this.speed = 10;
        this.name = "";
        this.miniJeuCanvas = null;
        this.jeu = null;
        this.player = null;
        this.callbacks = [];
        this.hittable = false;
    }

    on(eventName: string, callback: ((data) => void)) {
        if(!this.callbacks[eventName]) this.callbacks[eventName] = [];
        this.callbacks[eventName].push(callback);
    }

    protected emit(eventName: string, data: any = {}) {
        if(!this.callbacks[eventName]) return;
        for (const callback of this.callbacks[eventName]) {
            callback(data);
        }
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

    /**
     * Initialise le canvas, et l'ajoute au body.
     * @param player
     * utilisé pour avertir de la fin du mini-jeu
     */
    public miniJeu(player: Player): void {
        this.player = player;
        this.miniJeuCanvas = document.createElement("canvas");
        this.miniJeuCanvas.width = window.innerWidth;
        this.miniJeuCanvas.height = window.innerHeight;
        document.body.appendChild(this.miniJeuCanvas);
        const c = $(this.miniJeuCanvas);
        c.addClass("task");
        this.initJeu();
    }
    /**
     * Fonction implémentée dans les classes filles
     * Affiche une nouvelle frame du jeu
     */
    public drawJeu(): void{}
    /**
     * Fonction implémentée dans les classes filles
     * Initialise la variable `jeu` contenant toutes les informations nécessaires au jeu.
     */
    public initJeu(): void{}

    /**
     * Fin du jeu, enlève le canvas, etc.
     * (j'aurais dûn l'appeler `endgame` tsss)
     * @param reussi
     * `true` si le joueur a fini le mini-jeu, `false` sinon (il le ferme ou va trop loin sans l'avoir fini)
     * @param delayed
     * `false` si le jeu doit s'arrêter instantanément (par ex le joueur s'éloigne)
     */
    public endJeu(reussi: boolean, delayed= true) {
        if (!delayed) {
            this.jeu = null;
            if (this.miniJeuCanvas)
                document.body.removeChild(this.miniJeuCanvas);
            this.miniJeuCanvas = null;
            if (reussi) {
                this.player.environment.interactions.splice(this.player.environment.interactions.indexOf(this), 1);
                this.player.objectInteract = null;
            }
            return;
        }
        const dj = this.drawJeu;
        setTimeout(() => {
            this.jeu = null;
            if (this.miniJeuCanvas)
                document.body.removeChild(this.miniJeuCanvas);
            this.miniJeuCanvas = null;
            if (reussi) {
                this.player.environment.interactions.splice(this.player.environment.interactions.indexOf(this), 1);
                this.player.objectInteract = null;
            } else {
                this.drawJeu = dj;
            }
        }, 1000);

        this.drawJeu = () => {
            const ctx = this.miniJeuCanvas.getContext("2d");
            ctx.clearRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
            ctx.fillStyle = reussi ? "#0F0" : "#F00";
            ctx.fillRect(0, 0, this.miniJeuCanvas.width, this.miniJeuCanvas.height);
        }
    }

    hit(o: Displayable): boolean {
        return ((
            this.cord.x + this.size.w >= o.cord.x &&
            this.cord.x + this.size.w <= o.cord.x + o.size.w
        ) || (
            this.cord.x >= o.cord.x &&
            this.cord.x <= o.cord.x + o.size.w
        )) && ((
            this.cord.y + this.size.h >= o.cord.y &&
            this.cord.y + this.size.h <= o.cord.y + o.size.h
        ) || (
            this.cord.y >= o.cord.y &&
            this.cord.y <= o.cord.y + o.size.h
        ));
    }
}