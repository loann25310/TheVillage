import {Partie, PartieStatus} from "../entity/Partie";
import {getRepository} from "typeorm";
import {User} from "../entity/User";

let gameRepo = getRepository(Partie);
let userRepo = getRepository(User);

export function Route(){}

export async function getAvailableRoom(uid) :Promise<number>{
    let user = await userRepo.findOne(uid);
    //si l'utilisateur est trouvé :
    if (user) {
        let lastGame = await gameRepo.findOne(user.partie);
        //Si sa dernière partie existe :
        if (lastGame) {
            if (lastGame.status === PartieStatus.STARTED){
                //si le joueur ne fais pas parti des joueurs de la partie
                if (!lastGame.players_playing.includes(user.id))
                    return
                //si le joueur est déjà en train de jouer
                if (lastGame.players.includes(user.id))
                    return
            }
            if (lastGame.players.length < Partie.nbJoueursMax)
                return lastGame.id;
            //checks that the user is not already playing (if so, return)
            for (let i = 0; i < lastGame.players.length; i++){
                if (lastGame.players[i] === user.id)
                    return
            }
        }
    }
    let games = await gameRepo.find({where: {status: `${PartieStatus.WAIT_USERS}`}});
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

export async function joinRoom(uid, gameId) :Promise<User[]>{
    let room = await gameRepo.findOne(gameId);
    if (!room) return null;
    if ((room.status !== PartieStatus.WAIT_USERS && room.status !== PartieStatus.CREATING && room.status !== PartieStatus.ENDED) || room.players.length >= Partie.nbJoueursMax) {
        return null;
    }
    //Si la partie s'est remplie entre le dernier test et maintenant,
    //le joueur ne peut pas rejoindre, on le renvoie au menu
    if (!room.addPlayer(uid)) {
        return null;
    }
    let p = await userRepo.findOne(uid);
    p.partie = room.id;
    await userRepo.save(p);
    //todo: start the game if Partie.status = STARTING
    room.status = room.players.length >= Partie.nbJoueursMax ? PartieStatus.STARTING : PartieStatus.WAIT_USERS;
    if (room.status === PartieStatus.STARTING)
        room.start();
    await gameRepo.save(room);
    return await room.getPlayers();
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