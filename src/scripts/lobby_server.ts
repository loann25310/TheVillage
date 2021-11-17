import {Partie, PartieStatus} from "../entity/Partie";
import {getRepository} from "typeorm";
import {User} from "../entity/User";

let partieRepository = getRepository(Partie);

export async function findRoom(socket, userId) {
    let user = await getRepository(User).findOne({where: {id: userId}});
    //Si l'user est déjà dans une partie, il la rejoint à nouveau
    let game = await partieRepository.findOne({where: {id: user.partie}})

    if (game !== undefined && game?.status !== PartieStatus.ENDED && game.players.length < Partie.nbJoueursMax){
        if (!socket.rooms.includes(game.name)){
            socket.join(game.name);
            socket.emit("join_room", game.id);
        }
        socket.emit("join_room", game.id);
        return;
    }
    let parties = await partieRepository.find();
    for (let i = 0; i < parties.length; i++) {
        let p = parties[i];
        if (p.status === PartieStatus.WAIT_USERS && p.players.length < Partie.nbJoueursMax) {
            p.addPlayer(userId);
            // Si la partie est remplie, elle commence
            if (p.players.length === Partie.nbJoueursMax){
                p.status = PartieStatus.STARTING;
            }
            await partieRepository.save(p);
            socket.join(p.name);
            socket.emit("join_room", p.name);
            console.log("user connected")
            return
        }
    }
    //Aucune partie de dispo : création de partie

    let p = new Partie();
    p.name = "";
    p.addPlayer(userId);
    let userRepo = getRepository(User);
    let u = await userRepo.findOne({where: {id: userId}});
    u.partie = p.id;
    await userRepo.save(u);
    p.status = PartieStatus.WAIT_USERS;
    await partieRepository.save(p);
    p.name = `PARTIE_${p.id}`;
    await partieRepository.save(p);
    socket.join(p.name);
    socket.emit("join_room", p.name);
    console.log("player connected")
}


export async function countPlayers(partyNumber) {
    let parties = await partieRepository.find({where: {id: partyNumber}});
    let party = parties[0];
    return party.players.length;
}