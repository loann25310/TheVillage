import {Displayable} from "../Displayable";
import {PlayerMove} from "../types/PlayerMove";
import {Coordinate} from "../types/Coordinate";
import {Map} from "../Map";
import {Roles} from "../roles/Roles";
import {Tools} from "../Tools";
import {ObjectType} from "../types/ObjectType";

export abstract class Player extends Displayable {

    public static imgR1: HTMLImageElement;
    public static imgR2: HTMLImageElement;
    public static imgR3: HTMLImageElement;
    public static imgL1: HTMLImageElement;
    public static imgL2: HTMLImageElement;
    public static imgL3: HTMLImageElement;
    public static deadimgR1: HTMLImageElement;
    public static deadimgR2: HTMLImageElement;
    public static deadimgR3: HTMLImageElement;
    public static deadimgR4: HTMLImageElement;
    public static deadimgL1: HTMLImageElement;
    public static deadimgL2: HTMLImageElement;
    public static deadimgL3: HTMLImageElement;
    public static deadimgL4: HTMLImageElement;
    private readonly decalage: number;
    public static readonly defaultSize = { w: 80, h: 186 };
    image: HTMLImageElement;
    public isLocal;
    pid: number;
    public objectInteract: Displayable = null;
    private getImg;
    public goesRight: boolean;
    hasAction: boolean;
    alive: boolean;
    role: Roles;
    distancePlayers: {player: Player, distance: number}[];
    abstract DISTANCE_FOR_ACTION: number;
    playerForAction: Player;

    public x;
    public y;

    protected constructor(ctx, environment, positonDraw: Coordinate, size, map: Map, index) {
        super(ctx, positonDraw, size, null );
        this.getImg = this.GeneratorGetImg();
        this.environment = environment;
        this.cord = { x: positonDraw.x, y: positonDraw.y};
        this.goesRight = true;
        this.image = this.getImg.next().value;
        this.x = 0;
        this.y = 0;
        this.decalage = Math.random() * 1000;
        this.hasAction = false;
        this.alive = true;
        this.role = Roles.Villageois;
        this.distancePlayers = [];
        this.playerForAction = null;
        this.initSpawn(map, index);
    }

    initSpawn(map: Map, index) {
        this.x = map.players_spawn[index].x;
        this.y = map.players_spawn[index].y;
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

    move(type: PlayerMove, sprint: boolean, check=true) {
        if (!this.alive) return;
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
        if (check) {
            let hits = this.environment.getHitBox(this.getPosition(), this.size);
            for (const o of hits) {
                if (this.hit(o)) {
                    this.move(antiMovement, sprint, false);
                    break;
                }
            }
        }

        this.emit("move");
        this.checkInteractions();
        this.updateAllDistances();
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
        return {
            x: this.environment.origine.x + this.x,
            y: this.environment.origine.y + this.y
        };
    }

    draw() {
        if (!this.alive)
            this.image = this.getImg.next().value as HTMLImageElement;
        this.ctx.font = "10px sans-serif";
        //this.ctx.fillStyle = "#f00";
        //this.ctx.fillRect( this.getDrawnPosition().x, this.getDrawnPosition().y, this.size.w, this.size.h);
        this.ctx.drawImage(this.image, this.getDrawnPosition().x, this.getDrawnPosition().y, this.size.w, this.size.h);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(this.getDrawnPosition().x, this.getDrawnPosition().y + this.size.h - 5, this.size.w, 40 );
        this.ctx.textAlign = "center";
        if(this.isLocal) {
            this.drawInfo();
            this.ctx.fillStyle = "#0080ff";
        }
        else
            this.ctx.fillStyle = "#f00";
        this.ctx.fillText(`[ PID : ${this.pid} ]`, this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y + this.size.h + 5);
        this.ctx.fillText(`{ x: ${this.cord.x}, y: ${this.cord.y} }`, this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y + this.size.h + 18);
        this.ctx.fillText(`{ x: ${this.getDrawnPosition().x}, y: ${this.getDrawnPosition().y} }`, this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y + this.size.h + 29);
        if (!this.isLocal && this.role !== null && this.role !== undefined) {
            this.ctx.fillStyle = this.role === Roles.LoupGarou ? "red" : "blue";
            this.ctx.fillText(Tools.getRoleName(this.role), this.getDrawnPosition().x + (this.size.w / 2), this.getDrawnPosition().y - 15);
        }
    }
    drawInfo() {}

    checkInteractions() {
        let seen = false;
        for (const object of this.environment.interactions) {
            if (object.hidden) continue;
            // J'ai l'impression des fois que ça ne prend pas le milieu du perso / de l'objet, mais le point en haut à droite, jsp pourquoi
            const dist = Math.sqrt(((this.x + (this.size.w / 2) - object.cord.x - (object.size.w / 2)) ** 2) + ((this.y + (this.size.h / 2) - object.cord.y - (object.size.h / 2)) ** 2));
            const diag = (Math.sqrt((object.size.w) ** 2 + object.size.h ** 2) / 2) + 150;
            if (dist <= diag) {
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
            //au démarrage, envoyait l'image du mort
            if (this.alive !== false) {
                if (millis < 250)
                    yield this.goesRight ? Player.imgR1 : Player.imgL1; //Bonhomme2
                else if (millis < 500)
                    yield this.goesRight ? Player.imgR2 : Player.imgL2; // Bonhomme1
                else if (millis < 750)
                    yield this.goesRight ? Player.imgR1 : Player.imgL1; // Bonhomme2
                else
                    yield this.goesRight ? Player.imgR3 : Player.imgL3;  // Bonhomme3
            } else {
                if (millis < 250)
                    yield this.goesRight ? Player.deadimgR2 : Player.deadimgL2;
                else if (millis < 500)
                    yield this.goesRight ? Player.deadimgR1 : Player.deadimgL1;
                else if (millis < 750)
                    yield this.goesRight ? Player.deadimgR3 : Player.deadimgL3;
                else
                    yield this.goesRight ? Player.deadimgR4 : Player.deadimgL4;
            }
        }
    }

    hit(o: Displayable): boolean {
        if (o.hidden) return ;
        if (o.name === ObjectType.maison) {
            return o.hit(this);
        }
        const pos = this.getPosition();
        pos.x -= this.size.w / 2;
        pos.y -= this.size.h / 2;
        return ((
            pos.x + this.size.w >= o.cord.x + 5 &&
            pos.x + this.size.w <= o.cord.x + o.size.w - 5
        ) || (
            pos.x >= o.cord.x + 5 &&
            pos.x <= o.cord.x + o.size.w - 5
        )) && ((
            pos.y + this.size.h >= o.cord.y + 25 &&
            pos.y <= o.cord.y + o.size.h - 5
        ));
    }

    abstract action(...params);

    abstract checkAction(player: Player): boolean;

    die() {
        this.alive = false;
    }

    revive() {
        this.alive = true;
    }

    removeOtherPLayer(player: Player) {
        for (let i = 0; i < this.distancePlayers.length; i++) {
            if (this.distancePlayers[i].player.pid === player.pid) {
                this.distancePlayers.splice(i, 1);
                return;
            }
        }
    }

    addOtherPlayer(player: Player) {
        this.removeOtherPLayer(player);
        const distance = Math.sqrt((this.getPosition().x - player.getPosition().x) ** 2 + (this.getPosition().y - player.getPosition().y) ** 2);
        this.distancePlayers.push({player, distance});
    }

    updateDistance(id) {
        for (let i = 0; i < this.distancePlayers.length; i++) {
            if (this.distancePlayers[i].player.pid === id) {
                this.distancePlayers[i].distance = Math.sqrt((this.getPosition().x - this.distancePlayers[i].player.getPosition().x) ** 2 + (this.getPosition().y - this.distancePlayers[i].player.getPosition().y) ** 2);
                break;
            }
        }
        this.sortDistances();
    }

    updateAllDistances() {
        for (let i = 0; i < this.distancePlayers.length; i++) {
            this.distancePlayers[i].distance = Math.sqrt((this.getPosition().x - this.distancePlayers[i].player.getPosition().x) ** 2 + (this.getPosition().y - this.distancePlayers[i].player.getPosition().y) ** 2);
        }
        this.sortDistances();
    }

    sortDistances() {
        const arr = [];
        while (this.distancePlayers.length > 0) {
            let indexMin = 0;
            for (let i = 1; i < this.distancePlayers.length; i++) {
                if (this.distancePlayers[i].distance < this.distancePlayers[indexMin].distance) indexMin = i;
            }
            arr.push(this.distancePlayers.splice(indexMin, 1)[0]);
        }
        if (arr.length === 0) return;
        this.distancePlayers = arr;
        if (arr[0].distance <= this.DISTANCE_FOR_ACTION && this.playerForAction?.pid !== arr[0].player.pid && this.checkAction(arr[0].player)) {
            this.emit("action_available", arr[0].player);
        } else if (arr[0].distance > this.DISTANCE_FOR_ACTION && this.playerForAction !== null)
            this.emit("action_unavailable");
    }

    slideTo(coordonnes: Coordinate, duration: number = 50): Promise<Coordinate> {
        return new Promise((resolve, reject) => {
            let delta = {
                x: (coordonnes.x - this.x) / duration,
                y: (coordonnes.y - this.y) / duration
            };
            for (let i = 1; i < duration; i++) {
                setTimeout(() => {
                    this.x += delta.x;
                    this.y += delta.y;
                }, i);
            }
            setTimeout(() => {
                this.x = coordonnes.x;
                this.y = coordonnes.y;
                resolve(coordonnes);
            }, duration);
        });
    }
}