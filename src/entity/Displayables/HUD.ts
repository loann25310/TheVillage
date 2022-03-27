import {Displayable} from "./Displayable";
import {Player} from "./Props/Player";
import {Task} from "../Task";

export class HUD extends Displayable {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;

    actionImage: HTMLImageElement;
    fleche: HTMLImageElement;
    static readonly actionButtonSize = 100;

    static miniJeu: boolean;
    static actionPossible: boolean;

    constructor(data: { canvas: HTMLCanvasElement, player: Player }) {
        super(data.canvas.getContext('2d'), {x: 0, y: 0}, {w: 0, h: 0}, "normal");
        this.canvas = data.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.player = data.player;

        this.actionImage = document.createElement("img");
        this.actionImage.src = "/img/action.png";

        this.fleche = document.createElement("img");
        this.fleche.src = `/img/fleche.png`;

        this.setupEventHandlers();
    }

    draw() {
        super.draw();
        let ctx = this.ctx;
        let canvas = this.canvas;

        if(HUD.miniJeu) return;

        const tasks: Task[] = [];

        for (const interaction of this.player.environment.interactions) {
            if (!interaction) continue;
            tasks.push(Task.fromDisplayable(interaction));
        }
        for (const interaction of this.player.environment.doneInteractions) {
            if (!interaction) continue;
            let task = Task.fromDisplayable(interaction);
            task.done = true;
            tasks.push(task);
        }

        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(0, 0, 300, 40 + (tasks.length * 23));


        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "20px sans-serif";
        ctx.fillText("Tâches", 150, 25);


        ctx.textAlign = "left";
        ctx.font = "17px sans-serif";
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];

            if(!task.done)
                ctx.fillStyle = "#000";
            else
                ctx.fillStyle = "#0f0";

            ctx.fillText(task.text, 10, ((i + 1) * 23) + 25, 280);

            if(task.done)
                ctx.fillRect(9, ((i + 1) * 23) + 20, Math.min(ctx.measureText(task.text).width, 281), 1);
        }

        if (!this.player.alive) {
            ctx.textAlign = "center";
            ctx.font = "30px sans-serif";
            ctx.fillStyle = "red";
            ctx.fillText(`You are dead !`, window.innerWidth / 2, window.innerHeight - 300);
        } else if (this.player.objectInteract !== null && !HUD.miniJeu) {
            ctx.textAlign = "center";
            ctx.font = "30px sans-serif";
            ctx.fillStyle = "red";
            //ctx.fillText(`[E] pour interagir avec ${this.player.objectInteract.name}`, window.innerWidth / 2, window.innerHeight - 300);

            ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = 0.5;
        }

        ctx.drawImage(this.actionImage, canvas.width - HUD.actionButtonSize - 10, canvas.height - HUD.actionButtonSize - 10, HUD.actionButtonSize, HUD.actionButtonSize);
        ctx.globalAlpha = 1;

        if (HUD.actionPossible) {
            ctx.textAlign = "center";
            ctx.font = "30px sans-serif";
            ctx.fillStyle = "blue";
            ctx.fillText(`[F] pour ACTION sur ${this.player.playerForAction.pid}`, window.innerWidth / 2, window.innerHeight - 500);
        }

        if (HUD.miniJeu) return;
        for (const inter of this.environment.interactions) {
            let x = 0;
            let y = 0;

            //négatif si l'objet est à gauche
            const grande_distance_x = inter.cord.x - this.player.getPosition().x;
            //négatif si l'objet est au-dessus
            const grande_distance_y = inter.cord.y - this.player.getPosition().y;

            //L'objet est sur l'écran
            if (Math.abs(grande_distance_x) < window.innerWidth / 2 && Math.abs(grande_distance_y) < window.innerHeight / 2) {
                x = inter.getPosition().x + inter.size.w / 2 - 10;
                y = inter.getPosition().y - 50;
                ctx.drawImage(this.fleche, x, y, 50, 50);
                return;
            } else {
                ctx.save();
                ctx.beginPath();
                //L'objet n'est pas sur l'écran
                let angle = Math.atan(grande_distance_y / grande_distance_x);

                x = Math.max(Math.min(inter.getPosition().x, this.player.getDrawnPosition().x + window.innerWidth / 2 - 70), this.player.getDrawnPosition().x - window.innerWidth / 2 + 70);
                y = Math.max(Math.min(inter.getPosition().y, this.player.getDrawnPosition().y + window.innerHeight / 2 - 70), this.player.getDrawnPosition().y - window.innerHeight / 2 + 140);

                if (x <= (window.innerWidth / 2)) angle += Math.PI;
                ctx.translate(x, y);
                x = 0;
                y = 0;
                ctx.rotate(angle - Math.PI / 2);
                ctx.drawImage(this.fleche, x, y,50, 50);

                ctx.restore();
            }
        }
    }

    private setupEventHandlers() {

        let canvas = this.canvas;

        canvas.addEventListener("click", (e) => {
            if(!e.isTrusted) return;

            if(
                (e.clientX >= canvas.width - HUD.actionButtonSize - 10 && e.clientX <= canvas.width - 10) &&
                (e.clientY >= canvas.height - HUD.actionButtonSize - 10 && e.clientY <= canvas.height - 10) &&
                (!HUD.miniJeu && this.player.objectInteract !== null)
            ){
                HUD.miniJeu = true;
                this.player.objectInteract.miniJeu(this.player);
            }
        });

    }
}