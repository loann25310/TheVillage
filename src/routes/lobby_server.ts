import {Partie, PartieStatus} from "../entity/Partie";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {Tools} from "../entity/Tools";

let gameRepo = getRepository(Partie);
let userRepo = getRepository(User);

export function Route(){}

export async function getAvailableRoom(uid): Promise<string>{
    let user = await userRepo.findOne(uid);
    if (user) {
        let lastGame = await gameRepo.findOne(user.partie);
        //Si sa dernière partie n'a pas commencé
        if (lastGame && (lastGame.status === PartieStatus.WAIT_USERS || lastGame.status === PartieStatus.CREATING)) {
            if (lastGame.players.length < lastGame.nbJoueursMax)
                return lastGame.id;
        }
    }
    let games = await gameRepo.find({where: {status: `${PartieStatus.WAIT_USERS}`, publique: true}});
    for (let i = 0; i < games.length; i++) {
        // Si la partie n'est pas pleine (et n'a pas commencé)
        if (games[i].players.length < games[i].nbJoueursMax)
            return games[i].id;
    }
    //Aucune partie n'est libre, on en créée une

    let newGame = new Partie();
    newGame.players = [];
    await save_game(newGame);
    return newGame.id
}

async function save_game(game: Partie) {
    try {
        game.id = Tools.generateRandomString(6);
        await gameRepo.save(game);
    }
    catch (e) {
        await save_game(game);
    }
}

export async function joinRoom(uid, gameId): Promise<Partie>{
    let room = await gameRepo.findOne(gameId);
    if (!room) return null;
    if ((room.status !== PartieStatus.WAIT_USERS && room.status !== PartieStatus.CREATING && room.status !== PartieStatus.ENDED) || room.players.length >= room.nbJoueursMax) {
        return null;
    }
    //Si la partie s'est remplie entre le dernier test et maintenant,
    //le joueur ne peut pas rejoindre, on le renvoie au menu
    if (!room.addPlayer(uid)) {
        return null;
    }
    let p = await userRepo.findOne(uid);
    p.partie = room.id;
    if (room.status === PartieStatus.CREATING)
        room.status = PartieStatus.WAIT_USERS;
    await userRepo.save(p);
    await gameRepo.save(room);
    return room;
}

export function disconnect(uid, io) {
    if (!uid)
        return
    userRepo.findOne(uid).then(u=>{
        if (!u){
            return;
        }
        gameRepo.findOne(u.partie).then(room => {
            if (!room || room.status === PartieStatus.STARTING) return;

            let index = room.players.indexOf(u.id);
            if (index === -1) return;

            room.players.splice(index, 1);
            gameRepo.save(room).then(()=>{
                room.getPlayers().then(p => {
                    io.to(`${room.id}`).emit("players", p);
                })
            })
        })
    })
}