import {Partie, PartieStatus} from "../entity/Partie";
import {getRepository} from "typeorm";

let partieRepository = getRepository(Partie);

export async function findRoom(socket, userId) {
    let parties = await partieRepository.find();
    for (let i = 0; i < parties.length; i++) {
        let p = parties[i];
        if (p.status === PartieStatus.WAIT_USERS && p.players.length < Partie.nbJoueursMax) {
            p.addPlayer(userId);
            await partieRepository.save(p);
            socket.join(p.name);
            socket.emit("join_room", p.id);
            console.log("user connected")
            return
        }
    }
    //Aucune partie de dispo : création de partie

    let p = new Partie();
    p.name = "";
    p.addPlayer(userId);
    p.status = PartieStatus.WAIT_USERS;
    await partieRepository.save(p);
    p.name = `PARTIE_${p.id}`;
    await partieRepository.save(p);
    socket.join(p.name);
    socket.emit("join_room", p.id);
    console.log("player connected")
}


export async function countPlayers(partyNumber){
    let party = await partieRepository.find({where:{id:partyNumber}})[0];
    return party.players.length;
}