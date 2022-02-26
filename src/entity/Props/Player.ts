import {Displayable} from "../Displayable";
import {PlayerMove} from "../types/PlayerMove";
import {Coordinate} from "../types/Coordinate";
import axios from "axios";

export class Player extends Displayable {

    public static imgR1: HTMLImageElement;
    public static imgR2: HTMLImageElement;
    public static imgR3: HTMLImageElement;
    public static imgL1: HTMLImageElement;
    public static imgL2: HTMLImageElement;
    public static imgL3: HTMLImageElement;
    private readonly decalage: number;
    public static readonly defaultSize = { w: 80, h: 186 };
    image: HTMLImageElement;
    public isLocal;
    pid: number;
    public objectInteract: Displayable = null;
    private getImg;
    public goesRight: boolean;

    public x;
    public y;

    constructor(ctx, environment, positonDraw: Coordinate, size) {
        super(ctx, positonDraw, size, null );
        this.getImg = this.GeneratorGetImg();
        this.environment = environment;
        this.cord = { x: positonDraw.x, y: positonDraw.y};
        this.goesRight = true;
        this.image = this.getImg.next().value;
        this.x = 0;
        this.y = 0;
        this.decalage = Math.random() * 1000;
        this.initSpawn().then();
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
        let antiMovement;
        this.image = this.getImg.next().value as HTMLImageElement;
        let pixelSprint = 4;
        let pixelNoSprint = 1;
        let condition = (sprint) ? pixelSprint : pixelNoSprint;
        switch (type) {
            case PlayerMove.moveN:
                antiMovement = PlayerMove.moveS;
                this.y -= condition;
                this.environment.move({x:0,y:condition});
                break;
            case PlayerMove.moveNE:
                antiMovement = PlayerMove.moveSW;
                this.goesRight = true;
                this.y -= Math.round(condition * 0.707);
                this.x += Math.round(condition * 0.707);
                this.environment.move({x:-Math.round(condition * 0.707),y:Math.round(condition * 0.707)});
                break;
            case PlayerMove.moveE:
                antiMovement = PlayerMove.moveW;
                this.goesRight = true;
                this.x += condition;
                this.environment.move({x:-condition,y:0});
                break;
            case PlayerMove.moveSE:
                antiMovement = PlayerMove.moveNW;
                this.goesRight = true;
                this.x += Math.round(condition * 0.707);
                this.y += Math.round(condition * 0.707);
                this.environment.move({x:-Math.round(condition * 0.707),y:-Math.round(condition * 0.707)});
                break;
            case PlayerMove.moveS:
                antiMovement = PlayerMove.moveN;
                this.y += condition;
                this.environment.move({x:0,y:-condition});
                break;
            case PlayerMove.moveSW:
                antiMovement = PlayerMove.moveNE;
                this.goesRight = false;
                this.y += Math.round(condition * 0.707);
                this.x -= Math.round(condition * 0.707);
                this.environment.move({x:Math.round(condition * 0.707),y:-Math.round(condition * 0.707)});
                break;
            case PlayerMove.moveW:
                antiMovement = PlayerMove.moveE;
                this.goesRight = false;
                this.x -= condition;
                this.environment.move({x:condition,y:0});
                break;
            case PlayerMove.moveNW:
                antiMovement = PlayerMove.moveSE;
                this.goesRight = false;
                this.x -= Math.round(condition * 0.707);
                this.y -= Math.round(condition * 0.707);
                this.environment.move({x:Math.round(condition * 0.707),y:Math.round(condition * 0.707)});
                break;
        }
        const hits = (this.environment.getHitBox(this.getPosition(), this.size));
        for (const o of hits) {
            if (this.hit(o)) {
                return this.move(antiMovement, sprint);
            }
        }
        this.emit("move");
        this.checkInteractions();

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

    public *GeneratorGetImg() {
        while(true) {
            const millis = (new Date().getMilliseconds() + this.decalage) % 1000;
            if (millis < 250)
                yield this.goesRight ? Player.imgR1 : Player.imgL1; //Bonhomme2
            else if (millis < 500)
                yield this.goesRight ? Player.imgR2 : Player.imgL2; // Bonhomme1
            else if (millis < 750)
                yield this.goesRight ? Player.imgR1 : Player.imgL1; // Bonhomme2
            else
                yield this.goesRight ? Player.imgR3 : Player.imgL3;  // Bonhomme3
        }
    }

    hit(o: Displayable): boolean {
        const pos = this.getPosition();
        pos.x -= this.size.w / 2;
        pos.y -= this.size.h / 3 * 2;
        return ((
            pos.x + this.size.w >= o.cord.x &&
            pos.x + this.size.w <= o.cord.x + o.size.w
        ) || (
            pos.x >= o.cord.x &&
            pos.x <= o.cord.x + o.size.w
        )) && ((
            pos.y + this.size.h >= o.cord.y &&
            pos.y + this.size.h <= o.cord.y + o.size.h
        ));
    }
}