import {Router} from "express";
import {User} from "../entity/User";
import {Server} from "socket.io";
import {Partie} from "../entity/Partie";
import {disconnect, getAvailableRoom, joinRoom} from "../scripts/lobby_server";

export function Route(router: Router, io: Server) {
    router.get('/lobby/:room', async (req, res) => {
        let user = req.user as User;
        if(!user) return res.redirect('/?notlogged');
        let roomId = req.params.room;
        let players;
        if ((players = await joinRoom(user.id, roomId)) !== null) {
            io.to(roomId).emit("players", players);
            return res.render("lobby/lobby", {
                maxPlayers: Partie.nbJoueursMax,
                roomId,
                nbPlayers : players.length,
                players : JSON.stringify(players),
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