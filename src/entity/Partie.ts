import {Column, Entity, getRepository, PrimaryGeneratedColumn} from "typeorm";

import {User} from "./User";
import {deserializeUser} from "passport";

export enum PartieStatus {
    CREATING,
    WAIT_USERS,
    STARTING,
    STARTED,
    ENDED
}

@Entity()
export class Partie {

    static nbJoueursMax = 10;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: PartieStatus,
        default: PartieStatus.CREATING
    })
    status: PartieStatus;

    @Column({
        type: "simple-json",
    })
    players: number[];

    async getPlayers(): Promise<User[]> {
        return await getRepository(User).findByIds(this.players);
    }

    addPlayer(userId: number) :boolean{
        if (!this.players)
            this.players = [];
        if (this.players.length >= Partie.nbJoueursMax)
            return false;
        if (!this.players.includes(userId))
            this.players.push(userId);
        return true;
    }

}