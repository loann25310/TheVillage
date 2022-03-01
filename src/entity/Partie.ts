import {Column, Entity, getRepository, PrimaryColumn} from "typeorm";

import {User} from "./User";
import {Map} from "./Map";

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
        default: 240
    })
    dureeNuit :number;

    @Column({
        default: 0
    })
    gameMaster: number;

    @Column({
        type: "simple-json",
    })
    players: number[];

    @Column({
        type: "simple-json",

    })
    inGamePlayers: number[];

    @Column({
        type: "simple-json",
    })
    bans: number[];

    @Column()
    map: string;

    async getPlayers(): Promise<User[]> {
        return await getRepository(User).findByIds(this.players);
    }

    addPlayer(userId: number): boolean{
        this.players ??= [];
        if (this.players.length >= this.nbJoueursMax)
            return false;
        if (!this.players.includes(userId))
            this.players.push(userId);
        if (this.gameMaster === 0 || !this.players.includes(this.gameMaster))
            this.gameMaster = userId;
        return true;
    }

    addInGamePlayer(user: User) {
        if(this.inGamePlayers.includes(user.id))
            return;
        this.inGamePlayers.push(user.id);
        getRepository(Partie).save(this).then(r => {});
    }

    removeInGamePlayer(user: User) {
        if(!this.inGamePlayers.includes(user.id))
            return;
        this.inGamePlayers.splice(this.inGamePlayers.indexOf(user.id), 1);
        getRepository(Partie).save(this).then(r => {});
    }

    isInGame(user: User): boolean {
        return this.inGamePlayers.includes(user.id);
    }

    start(){
        this.status = PartieStatus.STARTED;
        // add stuff here if needed
        this.status = PartieStatus.STARTED;
    }

    getMap(fs, path): Map {
        try {
            if(this.map !== "")
                return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../public/maps/map_${this.map}.json`), "utf-8")) as Map;
        } catch (e) {}
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../public/maps/The_village.json`), "utf-8")) as Map;
    }

}