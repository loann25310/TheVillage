import {Displayable} from "../Displayable";
import {PlayerMove} from "../types/PlayerMove";
import {Coordinate} from "../types/Coordinate";
import axios from "axios";

export class Player extends Displayable {

    public static readonly defaultSize = { w: 80, h: 186 };
    private readonly image: HTMLImageElement;
    private readonly callbacks;
    public isLocal;
    pid: number;
    public objectInteract: Displayable = null;

    public x;
    public y;

    constructor(ctx, environment, positonDraw: Coordinate, size) {
        super(ctx, positonDraw, size, null );
        this.environment = environment;
        this.cord = { x: positonDraw.x, y: positonDraw.y};
        this.image = document.createElement("img");
        this.image.src = "/img/Bonhomme.png";
        this.callbacks = [];
        this.x = 0;
        this.y = 0;
        this.initSpawn();
    }

    async initSpawn() {
        let value = await axios.get('/map.json');
        this.x = value.data.players_spawn[0].x;
        this.y = value.data.players_spawn[0].y;
    }

    initLocal(pid: number, canvas: HTMLCanvasElement) {
        this.isLocal = true;
        this.pid = pid;
        this.environment.setOrigine({ x: 0, y: 0 });
        this.cord = { x: 0, y: 0 };
        this.environment.setCord({ x: this.getPosition().x + (canvas.width / 2) + (this.size.h / 2), y: this.getPosition().y + (canvas.height / 2) + (this.size.w / 2) });
    }

    initRemote(pid: number, cord: Coordinate, localPlayer: Player, canvas: HTMLCanvasElement) {
        this.isLocal = false;
        this.pid = pid;
        this.setCord(cord);
    }

    update() {
        super.update();
    }

    move(type: PlayerMove, sprint: boolean) {
        let pixelSprint = 4;
        let pixelNoSprint = 1;
        let condition = (sprint) ? pixelSprint : pixelNoSprint;
        switch (type) {
            case PlayerMove.moveN:
                this.y -= condition;
                this.environment.move({x:0,y:condition})
                break;
            case PlayerMove.moveNE:
                this.y -= Math.round(condition * 0.707);
                this.x += Math.round(condition * 0.707);
                this.environment.move({x:-Math.round(condition * 0.707),y:Math.round(condition * 0.707)})
                break;
            case PlayerMove.moveE:
                this.x += condition;
                this.environment.move({x:-condition,y:0})
                break;
            case PlayerMove.moveSE:
                this.x += Math.round(condition * 0.707);
                this.y += Math.round(condition * 0.707);
                this.environment.move({x:-Math.round(condition * 0.707),y:-Math.round(condition * 0.707)})
                break;
            case PlayerMove.moveS:
                this.y += condition;
                this.environment.move({x:0,y:-condition})
                break;
            case PlayerMove.moveSW:
                this.y += Math.round(condition * 0.707);
                this.x -= Math.round(condition * 0.707);
                this.environment.move({x:Math.round(condition * 0.707),y:-Math.round(condition * 0.707)})
                break;
            case PlayerMove.moveW:
                this.x -= condition;
                this.environment.move({x:condition,y:0})
                break;
            case PlayerMove.moveNW:
                this.x -= Math.round(condition * 0.707);
                this.y -= Math.round(condition * 0.707);
                this.environment.move({x:Math.round(condition * 0.707),y:Math.round(condition * 0.707)})
                break;
        }
        this.emit("move");
        this.checkInteractions();
    }

    on(eventName: string, callback: ((data) => void)) {
        if(!this.callbacks[eventName]) this.callbacks[eventName] = [];
        this.callbacks[eventName].push(callback);
    }

    private emit(eventName: string, data: any = {}) {
        if(!this.callbacks[eventName]) return;
        for (const callback of this.callbacks[eventName]) {
            callback(data);
        }
    }

    setCord(cord: Coordinate) {
        //super.setCord(cord);
        this.environment.move({
            x: this.cord.x - cord.x,
            y: this.cord.y - cord.y,
        });
    }

    getPosition(): Coordinate {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    getDrawnPosition(): Coordinate {
        const result = {
            x: this.environment.origine.x + this.x,
            y: this.environment.origine.y + this.y
        };
        // result.x += -(this.size.w / 2);
        // result.y += -(this.size.h / 2);
        return result;
    }

    draw() {
        this.ctx.font = "10px sans-serif";
        //this.ctx.fillStyle = "#f00";
        //this.ctx.fillRect( this.getDrawnPosition().x, this.getDrawnPosition().y, this.size.w, this.size.h);
        this.ctx.drawImage(this.image, this.getDrawnPosition().x, this.getDrawnPosition().y, this.size.w, this.size.h);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(this.getDrawnPosition().x, this.getDrawnPosition().y + this.size.h - 5, this.size.w, 40 );
        this.ctx.textAlign = "center";
        if(this.isLocal)
            this.ctx.fillStyle = "#0080ff";
        else
            this.ctx.fillStyle = "#f00";
        this.ctx.fillText(`[ PID : ${this.pid} ]`, this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y + this.size.h + 5);
        this.ctx.fillText(`{ x: ${this.cord.x}, y: ${this.cord.y} }`, this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y + this.size.h + 18);
        this.ctx.fillText(`{ x: ${this.getDrawnPosition().x}, y: ${this.getDrawnPosition().y} }`, this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y + this.size.h + 29);
    }

    checkInteractions() {
        let seen = false;
        for (const object of this.environment.interactions) {
            // J'ai l'impression des fois que ça ne prend pas le milieu du perso / de l'objet, mais le point en haut à droite, jsp pourquoi
            const dist = Math.sqrt(((this.x + (this.size.w / 2) - object.cord.x - (object.size.w / 2)) ** 2) + ((this.y + (this.size.h / 2) - object.cord.y - (object.size.h / 2)) ** 2));
            if (dist <= 200) {
                seen = true;
                // Won't fire the event if we are already next to the object.
                if (this.objectInteract === object) break;
                this.objectInteract = object;
                this.emit("task", object);
            }
        }
        if (!seen && this.objectInteract !== null) {
            this.emit("no_task");
            this.objectInteract = null;
        }
    }
}