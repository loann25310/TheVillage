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

    static nbJoueursMax = 10;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: "enum",
        enum: PartieStatus,
        default: PartieStatus.CREATING
    })
    status: PartieStatus;

    @Column({
        type: "simple-json",
    })
    players: number[] = [];

    async getPlayers(): Promise<User[]> {
        return await getRepository(User).findByIds(this.players);
    }

    addPlayer(userId: number){
        this.players.push(userId);
    }

}