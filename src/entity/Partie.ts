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

    @Column({
        type: "simple-json",
    })
    players_playing: number[];

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

    start(){
        this.players_playing = this.players;
        // add stuff here if needed
        this.status = PartieStatus.STARTED;
        //The game is updated (in db) right after this function.
        //It only has to be called in lobby_server.ts > joinRoom();
    }

}