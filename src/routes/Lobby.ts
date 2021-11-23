import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {Server} from "socket.io";
import {Partie} from "../entity/Partie";
import {countPlayers, disconnect, getAvailableRoom, joinRoom} from "../scripts/lobby_server";

let userRepo = getRepository(User);



export function Route(router: Router, io: Server) {
    router.get('/lobby/:room', async (req, res) => {
        let uid = req.session["passport"]?.user;
        if (uid) {
            let u = await userRepo.findOne(uid)
            let roomId = req.params.room
            if (await joinRoom(uid, roomId)) {
                let players = await countPlayers(roomId)
                let players2 = players.toString();
                players2 = players + "/" +Partie.nbJoueursMax;
                return res.render("lobby/lobby", {
                    roomId: req.params.room,
                    user: u,
                    nbPlayers: players2
                });
            }
        }
        res.redirect("/?roomfull=1")
    });

    io.on("connection", async (socket) =>{
        socket.on("ask_room", async (userId) =>{
            let u = await userRepo.findOne(userId)
            socket.emit("room_found", await getAvailableRoom(userId));
        });

        socket.on("chat_message", (pseudo, msg, room) =>{
            io.to(room).emit("chat_message", pseudo, msg)
        });

        socket.on("new_guy", (uid, room) => {
            socket.data.uid = uid;
            socket.join(`${room}`)
            io.to(room).emit("new_player", uid, socket.id);
        })

        socket.on("disconnecting", ()=>{
            disconnect(socket.data.uid);
        })
    })
}