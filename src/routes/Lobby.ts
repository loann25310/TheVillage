import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {Server} from "socket.io";
import {Partie} from "../entity/Partie";
import {disconnect, getAvailableRoom, joinRoom} from "../scripts/lobby_server";

let userRepo = getRepository(User);



export function Route(router: Router, io: Server) {
    router.get('/lobby/:room', async (req, res) => {
        let user = req.user as User;
        if(!user) return res.redirect('/?notlogged');
        let roomId = req.params.room;
        let nbPlayers;
        if ((nbPlayers = await joinRoom(user.id, roomId)) !== -1) {
            io.to(roomId).emit("nbPlayers", nbPlayers);
            return res.render("lobby/lobby", {
                maxPlayers: Partie.nbJoueursMax,
                roomId,
                nbPlayers,
                user
            });
        }
        res.redirect("/?roomfull=1")
    });

    io.on("connection", async (socket) =>{
        socket.on("ask_room", async (userId) =>{
            socket.emit("room_found", await getAvailableRoom(userId));
        });

        socket.on("chat_message", (pseudo, msg, room) =>{
            io.to(room).emit("chat_message", pseudo, msg)
        });

        socket.on("new_guy", (uid :number, room) => {
            socket.data.uid = uid;
            socket.join(`${room}`)
            io.to(room).emit("new_player", uid, socket.id);
        })

        socket.on("disconnecting", ()=>{
            disconnect(socket.data.uid, io);
        })
    })
}