import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {Server} from "socket.io";
import {getAvailableRoom, joinRoom} from "../scripts/lobby_server";
import {Partie, PartieStatus} from "../entity/Partie";

let userRepo = getRepository(User);
let partieRepo = getRepository(Partie);


export function Route(router: Router, io: Server) {
    router.get('/lobby/:room', async (req, res) => {
        let uid = req.session["passport"]?.user;
        if (uid) {
            let u = await userRepo.findOne(uid)
            let roomId = req.params.room
            if (await joinRoom(uid, roomId))
                return res.render("lobby/lobby", {roomId: req.params.room, user: u});
        }else console.log("user is undefined")
        res.redirect("/?roomfull=1")
    });

    io.on("connection", async (socket) =>{
        socket.on("ask_room", async (userId) =>{
            let u = await userRepo.findOne(userId)
            console.log(`${userId} wants a room !`);
            socket.emit("room_found", await getAvailableRoom(userId));
        });

        socket.on("chat_message", (msg, room) =>{
            console.log(room, msg, socket)
            io.to(room).emit("chat_message", msg)
        });

        socket.on("new_guy", (uid, room) => {
            socket.join(`${room}`)
            console.log("it's me mario " + room)
            io.to(room).emit("new_player", uid, socket.id);
            socket.emit("new_player", uid, socket.id);
        })
    })
}