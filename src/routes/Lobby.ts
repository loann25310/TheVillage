import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {Server as SocketIOServer, Socket} from "socket.io";
import {findRoom} from "../scripts/lobby_server";
import {Partie} from "../entity/Partie";

let userRepo = getRepository(User);
let partieRepo = getRepository(Partie);


export function Route(router: Router, io: SocketIOServer) {
    router.get('/lobby/:room', (req, res) => {
        res.render("lobby/lobby", {roomId: req.params.room});
    });

    io.on("connection", async (socket) =>{
        socket.on("ask_room", async (userId) =>{
            socket.data.userId = userId;
            let roomId = await findRoom(socket, userId);
        })

        socket.on("chat_message", (msg, room) =>{
            console.log(room, msg)
            io.to(room).emit("chat_message", msg)
        })

        socket.on('disconnecting', async () => {
            let it = socket.rooms.values();
            let user = await userRepo.findOne({where: {id: socket.data.userId}});
            let room;
            while ( !(room = it.next()).done ) {
                let roomName = room.value;
                if (roomName.startsWith("PARTIE")){
                    let partie = await partieRepo.findOne({where: {name: roomName}})
                    if (partie !== undefined && partie.players.includes(user.id)) {
                        let index = partie.players.indexOf(user.id);
                        // removes the player from the game
                        partie.players.splice(index, 1);
                        await partieRepo.save(partie);
                    }
                }
            }
        })
    })
}

