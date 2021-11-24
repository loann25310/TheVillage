import {Displayable} from "../Displayable";
import {PlayerMove} from "../types/PlayerMove";
import {Coordinate} from "../types/Coordinate";
import {Environment} from "../Environment";

export class Player extends Displayable {

    public static readonly defaultSize = { w: 100, h: 152 };
    private readonly image: HTMLImageElement;
    private readonly callbacks;
    public isLocal;
    pid: number;

    constructor(ctx, environment, positon: Coordinate, size) {
        super(ctx, positon, size, null );
        this.environment = environment;
        this.cord = { x: 0, y: 0};
        this.image = document.createElement("img");
        this.image.src = "/img/player.png";
        this.callbacks = [];
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
        let vector: Coordinate = { x: 0, y: 0};

        //sprint = false;

        switch (type) {
            case PlayerMove.moveN:
                vector.y += (sprint)?4:1;
                break;
            case PlayerMove.moveNE:
                vector.y += (sprint)?4:1;
                vector.x -= (sprint)?4:1;
                break;
            case PlayerMove.moveE:
                vector.x -= (sprint)?4:1;
                break;
            case PlayerMove.moveSE:
                vector.x -= (sprint)?4:1;
                vector.y -= (sprint)?4:1;
                break;
            case PlayerMove.moveS:
                vector.y -= (sprint)?4:1;
                break;
            case PlayerMove.moveSW:
                vector.y -= (sprint)?4:1;
                vector.x += (sprint)?4:1;
                break;
            case PlayerMove.moveW:
                vector.x += (sprint)?4:1;
                break;
            case PlayerMove.moveNW:
                vector.x += (sprint)?4:1;
                vector.y += (sprint)?4:1;
                break;
        }

        if(sprint)
            this.environment.setSpeed(60);
        else
            this.environment.setSpeed(30);

        this.cord.x -= vector.x;
        this.cord.y -= vector.y;

        this.emit("playerMove", {
            cord: this.cord
        });

        this.environment.move(vector);
    }

    on(eventName: string, callback: ((data) => void)) {
        if(!this.callbacks[eventName]) this.callbacks[eventName] = [];
        this.callbacks[eventName].push(callback);
    }

    private emit(eventName: string, data) {
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
        const result = super.getPosition();
        result.x += -(this.size.w / 2);
        result.y += -(this.size.h / 2);
        return result;
    }

    draw() {
        this.ctx.drawImage(this.image, this.getPosition().x, this.getPosition().y, this.size.w, this.size.h);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(this.getPosition().x, this.getPosition().y + this.size.h - 5, this.size.w, 40 );
        this.ctx.textAlign = "center";
        if(this.isLocal)
            this.ctx.fillStyle = "#0080ff";
        else
            this.ctx.fillStyle = "#f00";
        this.ctx.fillText(`[ PID : ${this.pid} ]`, this.getPosition().x + (this.size.w / 2), this.getPosition().y + this.size.h + 5);
        this.ctx.fillText(`{ x: ${this.cord.x}, y: ${this.cord.y} }`, this.getPosition().x + (this.size.w / 2), this.getPosition().y + this.size.h + 18);
        this.ctx.fillText(`{ x: ${this.getPosition().x}, y: ${this.getPosition().y} }`, this.getPosition().x + (this.size.w / 2), this.getPosition().y + this.size.h + 29);
    }

}