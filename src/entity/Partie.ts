import {Column, Entity, getRepository, PrimaryColumn} from "typeorm";

import {User} from "./User";
import {Map} from "./Map";
import {Roles} from "./roles/Roles";

export enum PartieStatus {
    CREATING,
    WAIT_USERS,
    STARTING,
    STARTED,
    ENDED
}

@Entity()
export class Partie {

    public static readonly NB_JOUEURS_MIN = 7;

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

    @Column({
        type: "simple-json",
    })
    roles: {uid: number, role: Roles}[];

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

    async start(){
        this.status = PartieStatus.STARTING;
        this.init();
        await getRepository(Partie).save(this);
    }

    getMap(fs, path): Map {
        try {
            if(this.map !== "")
                return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../public/maps/map_${this.map}.json`), "utf-8")) as Map;
        } catch (e) {}
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../public/maps/The_village.json`), "utf-8")) as Map;
    }

    init() {
        const j = [];
        this.players.forEach(p => j.push(p));
        const joueurs = [];
        while (j.length > 0){
            joueurs.push(j.splice(Math.floor(Math.random() * j.length), 1)[0]);
        }
        this.roles = [];
        this.roles.push({uid : joueurs[0], role: Roles.Voyante});
        this.roles.push({uid : joueurs[1], role: Roles.Sorciere});
        this.roles.push({uid : joueurs[2], role: Roles.Chasseur});
        this.roles.push({uid : joueurs[3], role: Roles.LoupGarou});
        this.roles.push({uid : joueurs[4], role: Roles.LoupGarou});
        for (let i = 5; this.roles.length < this.players.length; i++) {
            this.roles.push({uid: joueurs[i], role: Roles.Villageois});
        }
        console.log(this.roles);
    }
}