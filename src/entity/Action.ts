import {ActionType} from "./types/ActionType";
import {getRepository} from "typeorm";
import {User} from "./User";

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
        return `[${this.time.getHours()}h${this.time.getMinutes()}] :`;
    }

    async toString() {
        const victim = this.victim !== 0 ? (await getRepository(User).findOne(this.victim)) : {pseudo: ""};
        const maker = this.maker !== 0 ? (await getRepository(User).findOne(this.maker)) : {pseudo: ""};
        switch (this.type) {
            case ActionType.EXPELLED:
                return `${this.getDate()} Le village a éliminé ${victim.pseudo}`;
            case ActionType.DRINK:
                return `${this.getDate()} ${maker.pseudo} a bu une poche de sang`;
            case ActionType.KILL:
                return `${this.getDate()} ${maker.pseudo} a tué ${victim.pseudo}`;
            case ActionType.REVEAL:
                return `${this.getDate()} ${maker.pseudo} a révélé le rôle de ${victim.pseudo}`;
            case ActionType.REVIVE:
                return `${this.getDate()} ${maker.pseudo} a ressuscité ${victim.pseudo}`;
        }
    }
}