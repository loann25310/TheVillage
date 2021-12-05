import {Column, Entity, getRepository, PrimaryGeneratedColumn} from "typeorm";

import {User} from "./User";

export enum PartieStatus {
    CREATING,
    WAIT_USERS,
    STARTING,
    STARTED,
    ENDED
}

@Entity()
export class Partie {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: PartieStatus,
        default: PartieStatus.CREATING
    })
    status: PartieStatus;

    @Column({
        default: 10
    })
    nbJoueursMax :number;

    @Column({
        default: 60
    })
    dureeVote :number;

    @Column({
        default: 0
    })
    gameMaster :number;

    @Column({
        type: "simple-json",
    })
    players: number[];

    async getPlayers(): Promise<User[]> {
        return await getRepository(User).findByIds(this.players);
    }

    addPlayer(userId: number) :boolean{
        this.players ??= [];
        if (this.players.length >= this.nbJoueursMax)
            return false;
        if (!this.players.includes(userId))
            this.players.push(userId);
        if (this.players.length === 1)
            this.gameMaster = userId;
        return true;
    }

    start(){
        // add stuff here if needed
        this.status = PartieStatus.STARTED;
    }

}