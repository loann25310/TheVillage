import {Column, Entity, getRepository, PrimaryColumn} from "typeorm";

import {User} from "./User";
import {Map} from "./Map";
import {Roles} from "./types/Roles";
import {Action} from "./Action";
import {ActionType} from "./types/ActionType";
import {ObjectType} from "./types/ObjectType";

export enum PartieStatus {
    CREATING,
    WAIT_USERS,
    STARTING,
    STARTED,
    ENDED
}

@Entity()
export class Partie {

    public static readonly NB_JOUEURS_MIN = 5;
    public static readonly NB_TASKS_PER_DAY = 2;

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

    @Column()
    history: string = "";

    idTasks: {id: number, tasks: string[]}[];

    deadPlayers: number[];

    actions: Action[];

    votes: {id: number, nb_votes: number}[];

    async getPlayers(): Promise<User[]> {
        return await getRepository(User).findByIds(this.players);
    }

    addPlayer(userId: number): boolean{
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
        getRepository(Partie).save(this).then();
    }

    removeInGamePlayer(user: User) {
        if(!this.inGamePlayers.includes(user.id))
            return;
        this.inGamePlayers.splice(this.inGamePlayers.indexOf(user.id), 1);
        getRepository(Partie).save(this).then();
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

    /**
     * Creates the roles for the players in the game
     */
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
    }

    /**
     * Adds an action for the history of the game (displayed at the end)
     * @param maker
     * The player that did the action (0 if it is the village)
     * @param type
     * The type of the action
     * @param victim
     * The victim of the action (0 if there isn't)
     */
    addAction(maker: number, type: ActionType, victim: number) {
        if (!this.actions) this.actions = [];
        this.actions.push(new Action(maker, type, victim));
    }

    /**
     * Returns an HTML string containing every action done during the game as a list
     */
    async getHistory(): Promise<string> {
        if (!this.actions) return "<div>Aucun historique n'est disponible pour cette partie.</div>";
        let html = "<ul>";
        for (const a of this.actions) {
            let li = `<li style="color: ${a.color}">`;
            li += (await a.toString());
            html += li + `</li>`;
        }
        return html;
    }

    generateTasks() {
        this.idTasks = [];
        for (const id of this.players) {
            if (this.deadPlayers.includes(id)) continue;
            if (this.roles.find(p => p.uid === id).role === Roles.LoupGarou) this.idTasks.push({id, tasks: []});
            else {
                const possibleTasks = [ObjectType.caisse, ObjectType.foin, ObjectType.maison, ObjectType.sapin, ObjectType.arbre];
                const tasks = [];
                for (let i = 0; i < Partie.NB_TASKS_PER_DAY && possibleTasks.length > 0; i++) {
                    tasks.push(possibleTasks.splice(Math.floor(Math.random() * possibleTasks.length), 1)[0]);
                }
                this.idTasks.push({id, tasks});
            }
        }
    }

    kill(id: number) {
        if (!this.inGamePlayers.includes(id)) return;
        if (this.deadPlayers.includes(id)) return;
        this.deadPlayers.push(id);
    }

    revive(id: number) {
        const index = this.deadPlayers.findIndex(pid => pid === id);
        if (index === -1) return;
        this.deadPlayers.splice(index, 1);
    }

    /**
     * Checks for a victory :
     * @returns - `null` if no one wins (yet) |
     * @returns - `true` if the Villagers win |
     * @returns - `false` if the WereWolves win.
     */
    async victoire(): Promise<null | boolean> {
        const alive = this.inGamePlayers.filter(p => !this.deadPlayers.includes(p));
        let camp = null;
        for (const player of alive) {
            if (camp === null) camp = this.roles.find(p => p.uid === player).role === Roles.LoupGarou;
            else {
                //Si au moins 2 personnes ne sont pas dans le même camp
                if ((this.roles.find(p => p.uid === player).role === Roles.LoupGarou) !== camp) {
                    return null;
                }
            }
        }
        // Tout le monde est dans le même camp, victoire d'un des camps
        this.status = PartieStatus.ENDED;
        await getRepository(Partie).save(this);
        return !camp;
    }

    async checkTasks(io) {
        let compteur = 0;
        if (!this.idTasks) return;
        this.idTasks.forEach(t => {
            //Ne prends pas en compte les tâches des joueurs morts
            if (this.deadPlayers.includes(t.id)) return;
            compteur += t.tasks.length;
        });
        if (compteur > 0) {
            io.to(this.id).emit("nb_tasks", compteur);
        } else {
            io.to(this.id).emit("DAY", (await this.getPlayers()).map(p => {return {pid: p.id, avatar: p.avatar, pseudo: p.pseudo}}));
            this.votes = [];
        }
    }
}