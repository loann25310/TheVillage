import {ActionType} from "./types/ActionType";
import {getRepository} from "typeorm";
import {Player} from "./Displayables/Props/Player";

export class Action {
    maker: number; //The id of the guy who did the action (0 if it is the village)
    type: ActionType; //The type of the action
    victim: number; //The id of the victim of the action
    time: Date;
    color: string;

    constructor(maker, type, victim) {
        this.maker = maker;
        this.type = type;
        this.victim = victim;
        this.time = new Date();
        switch (type) {
            case ActionType.EXPELLED:
            case ActionType.KILL:
                this.color = "#F00";
                break;
            case ActionType.REVIVE:
                this.color = "#0F0";
                break;
            case ActionType.REVEAL:
                this.color = "#00F";
                break;
            case ActionType.DRINK:
                this.color = "#f56212";
                break;
        }
    }

    getDate() {
        return `[${this.time.getHours()} : ${this.time.getMinutes()}]`;
    }

    async toString() {
        const victim = this.victim === 0 ? {name: ""} : (await getRepository(Player).findOne({pid: this.victim}));
        const maker = this.maker === 0 ? {name: ""} : (await getRepository(Player).findOne({pid: this.maker}));
        switch (this.type) {
            case ActionType.EXPELLED:
                return `${this.getDate()} Le village a éliminé ${victim.name}`;
            case ActionType.DRINK:
                return `${this.getDate()} ${maker.name} a bu une poche de sang`;
            case ActionType.KILL:
                return `${this.getDate()} ${maker.name} a tué ${victim.name}`;
            case ActionType.REVEAL:
                return `${this.getDate()} ${maker.name} a révélé le rôle de ${victim.name}`;
            case ActionType.REVIVE:
                return `${this.getDate()} ${maker.name} a ressuscité ${victim.name}`;
        }
    }
}