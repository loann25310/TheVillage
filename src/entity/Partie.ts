import {Column, Entity, getRepository, PrimaryColumn} from "typeorm";

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

    public static readonly nbJoueursMin = 7;

    @PrimaryColumn()
    id: string;

    @Column({
        default: false
    })
    publique: boolean;

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

    @Column({
        type: "simple-json",
    })
    bans: number[];

    async getPlayers(): Promise<User[]> {
        return await getRepository(User).findByIds(this.players);
    }

    addPlayer(userId: number): boolean{
        this.players ??= [];
        if (this.players.length >= this.nbJoueursMax)
            return false;
        if (!this.players.includes(userId))
            this.players.push(userId);
        if (this.gameMaster === 0)
            this.gameMaster = userId;
        return true;
    }

    start(){
        this.status = PartieStatus.STARTED;
        // add stuff here if needed
        this.status = PartieStatus.STARTED;
    }

}