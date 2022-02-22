import {Coordinate} from "./types/Coordinate";
import {Environment} from "./Environment";
import {Player} from "./Props/Player";

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

    protected readonly callbacks;

    constructor(ctx, cord: Coordinate, size, color) {
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
        this.miniJeuCanvas.width = (window.innerWidth / 10) * 9;
        this.miniJeuCanvas.height = (window.innerHeight / 10) * 9;
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
     */
    public endJeu(reussi: boolean) {
        this.jeu = null;
        if (this.miniJeuCanvas)
            document.body.removeChild(this.miniJeuCanvas);
        this.miniJeuCanvas = null;
        if (reussi) {
            this.player.environment.interactions.splice(this.player.environment.interactions.indexOf(this), 1);
            this.player.objectInteract = null;
        }
    }
}