import {Partie, PartieStatus} from "../entity/Partie";
import {getRepository} from "typeorm";
import {User} from "../entity/User";

let gameRepo = getRepository(Partie);
let userRepo = getRepository(User);

export async function countPlayers(gameId) {
    let game = await gameRepo.findOne({where: {id: gameId}});
    return game?.players?.length;
}

export async function getAvailableRoom(uid) :Promise<number>{
    let user = await userRepo.findOne({where: {id: uid}});
    //si l'utilisateur est trouvé :
    if (user) {
        let lastGame = await gameRepo.findOne({where: {id: user.partie}});
        //Si sa dernière partie existe :
        if (lastGame) {
            if (lastGame.status === PartieStatus.WAIT_USERS && lastGame.players.length < Partie.nbJoueursMax) {
                //si sa dernière partie n'a pas encore commencé, il la rejoint à nouveau
                return lastGame.id;
            }
            //checks that the user is not already playing (if so, return)
            for (let i = 0; i < lastGame.players.length; i++){
                if (lastGame.players[i] === user.id)
                    return
            }
        }
    }
    let games = await gameRepo.find({where: {status: `${PartieStatus.WAIT_USERS}`}});
    console.log("" + JSON.stringify(games))
    for (let i = 0; i < games.length; i++) {
        // Si la partie n'est pas pleine (et n'a pas commencé)
        if (games[i].players.length < Partie.nbJoueursMax)
            return games[i].id;
    }
    //Aucune partie n'est libre, on en créée une

    let newGame = new Partie();
    newGame.players = [];
    await gameRepo.save(newGame);
    return newGame.id
}

export async function joinRoom(uid, gameId) :Promise<boolean>{
    let room = await gameRepo.findOne(gameId);
    if (!room) return false;
    if ((room.status !== PartieStatus.WAIT_USERS && room.status !== PartieStatus.CREATING) || room.players.length >= Partie.nbJoueursMax) {
        console.log(room.status);
        return false;
    }
    let players = await room.getPlayers();
    //Si la partie s'est remplie entre le dernier test et maintenant,
    //le joueur ne peut pas rejoindre, on le renvoie au menu
    if (!room.addPlayer(uid)) {
        return false;
    }
    let p = await userRepo.findOne(uid);
    p.partie = room.id;
    await userRepo.save(p);
    //todo: start the game if Partie.status = STARTING
    room.status = room.players.length >= Partie.nbJoueursMax ? PartieStatus.STARTING : PartieStatus.WAIT_USERS;
    await gameRepo.save(room);

    return true;
}

export async function disconnect(socketId) {
    let u = await userRepo.findOne({where: {socketId: socketId}});
    if (!u){
        return;
    }
    let room = await gameRepo.findOne(u.partie);
    if (room) {
        let index = room.players.indexOf(u.id);
        if (index !== -1){
            room.players.splice(index, 1);
        }
    }
}