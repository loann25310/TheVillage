import {Displayable} from "./Displayable";
import {Player} from "./Props/Player";
import {Box} from "./Props/Box";
import {PineTree} from "./Props/PineTree";
import {HayBale} from "./Props/HayBale";
import {Tree} from "./Props/Tree";
import {House} from "./Props/House";
import {Task} from "../Task";

export class HUD extends Displayable {

    ctx: CanvasRenderingContext2D;
    player: Player;

    constructor(data: { ctx: CanvasRenderingContext2D, player: Player }) {
        super(data.ctx, {x: 0, y: 0}, {w: 0, h: 0}, "normal");
        this.ctx = data.ctx;
        this.player = data.player;
    }

    draw() {
        super.draw();
        let ctx = this.ctx;

        const tasks: Task[] = [];

        for (const interaction of this.player.environment.interactions) {
            tasks.push(Task.fromDisplayable(interaction));
        }
        for (const interaction of this.player.environment.interactions) {
            let task = Task.fromDisplayable(interaction);
            task.done = true;
            tasks.push(task);
        }

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 300, 200);

        ctx.font = "10px sans-serif";
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];

            if(task.done)
                ctx.fillStyle = "#000";
            else
                ctx.fillStyle = "#0f0";

            ctx.fillText(task.text, 10, (i + 1) * 15);
        }

    }

}